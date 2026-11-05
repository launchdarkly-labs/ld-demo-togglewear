# ingress-nginx remediation on ld-core-demo-eks (Wiz High toxic combination)

Written 2026-11-05. Cluster: `ld-core-demo-eks`, us-east-1. Controller: community
`ingress-nginx` in namespace `ingress-nginx`, exposed by a LoadBalancer Service,
fronting every `*.launchdarklydemos.com` host (ToggleWear, ToggleBank, others).

## 1. What Wiz flagged and why

Wiz control wc-id-2918 fires when one workload combines: internet exposure
(the LB Service), high cluster privileges (ingress-nginx reads Secrets cluster-wide
and watches all Ingresses), and an image with "initial access" CVEs. The CVE
controls wc-id-3239 / wc-id-3238 are the IngressNightmare family plus the 2026
config-injection bugs. All of them end in code execution inside the controller
pod and disclosure of every TLS Secret it can read.

| CVE | Type | CVSS | Fixed in |
| --- | --- | --- | --- |
| CVE-2025-1974 | admission webhook RCE (unauthenticated, pod network) | 9.8 | v1.11.5, v1.12.1 |
| CVE-2025-24514 | `auth-url` annotation injection | 8.8 | v1.11.5, v1.12.1 |
| CVE-2025-1097 | `auth-tls-match-cn` annotation injection | 8.8 | v1.11.5, v1.12.1 |
| CVE-2025-1098 | `mirror` annotation injection | 8.8 | v1.11.5, v1.12.1 |
| CVE-2025-24513 | auth secret path traversal | 4.8 | v1.11.5, v1.12.1 |
| CVE-2026-24512 | `rules.http.paths.path` injection | 8.8 (vector) | v1.13.7, v1.14.3 |
| CVE-2026-3288 | `rewrite-target` injection | 8.8 | v1.13.8, v1.14.4, v1.15.0 |
| CVE-2026-4342 | comment-based config injection | 8.8 | v1.13.9, v1.14.5, v1.15.1 |

Project status: Kubernetes retired ingress-nginx in March 2026. The final releases
are controller v1.15.1 / v1.14.5 / v1.13.9 and Helm chart 4.15.1 / 4.14.5 / 4.13.9,
all tagged 2026-03-19 (the same day CVE-2026-4342 shipped). The GitHub repo was
archived read-only on 2026-03-24. There are no releases after March 2026, and the
project states there will be no further security fixes. Images and charts remain
downloadable. Repo `security/advisories` shows nothing; advisories were published
as kubernetes/kubernetes issues and on discuss.kubernetes.io instead. Any ingress-nginx
CVE found after 2026-03-19 will never be fixed upstream, which is why Wiz will keep
re-flagging this workload even after an upgrade to 1.15.1.

## 2. Decide

### Option A (do now, before re:Invent): upgrade in place to v1.15.1 and harden

Closes every published CVE and changes the image Wiz scanned. Low blast radius:
Ingress objects, annotations, cert-manager ingress-shim and the LB Service all stay
as they are. v1.15.1 supports Kubernetes 1.31 to 1.35; check the cluster version first.

```bash
# 0. Context and what is installed today
kubectl version
kubectl get pods -n ingress-nginx -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
helm list -n ingress-nginx            # empty output means a manifest install, see 1b
kubectl get svc -n ingress-nginx      # expect ONLY the controller svc to be type LoadBalancer
kubectl get validatingwebhookconfiguration ingress-nginx-admission
kubectl get cm -n ingress-nginx ingress-nginx-controller -o yaml | grep -E 'allow-snippet|annotations-risk'
kubectl get ingress -A -o json | jq -r '.items[].metadata.annotations // {} | keys[]' | sort | uniq -c | sort -rn
# the last line inventories annotations; Option A needs no changes unless *-snippet shows up

# 1a. Helm install: pin chart 4.15.1 (appVersion 1.15.1)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx && helm repo update
helm get values ingress-nginx -n ingress-nginx > /tmp/ingress-nginx-values.bak.yaml
helm upgrade ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx \
  --version 4.15.1 --reuse-values \
  --set controller.allowSnippetAnnotations=false \
  --set controller.config.annotations-risk-level=High \
  --set controller.enableAnnotationValidations=true \
  --set controller.admissionWebhooks.enabled=true
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx

# 1b. Manifest install (no Helm release): set the image to the pinned digest
kubectl set image deployment/ingress-nginx-controller -n ingress-nginx \
  controller=registry.k8s.io/ingress-nginx/controller:v1.15.1@sha256:594ceea76b01c592858f803f9ff4d2cb40542cae2060410b2c95f75907d659e1
kubectl patch cm ingress-nginx-controller -n ingress-nginx --type merge \
  -p '{"data":{"allow-snippet-annotations":"false","annotations-risk-level":"High"}}'
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx
# Reference manifest for a clean reinstall if needed:
# https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/aws/deploy.yaml
```

Hardening notes. `allow-snippet-annotations=false` and `annotations-risk-level=High`
are the upstream defaults but set them explicitly so drift cannot re-open the
injection class. The admission webhook was the CVE-2025-1974 vector; on 1.15.1 it is
patched and it is what rejects malformed Ingresses, so keep it on and confirm it is
not internet-reachable (section 3). Disable it (`controller.admissionWebhooks.enabled=false`,
or delete the ValidatingWebhookConfiguration and drop `--validating-webhook=:8443`)
only if you must stay on a vulnerable version. Every injection CVE needs rights to
create Ingresses, so keep that to the demo deploy pipeline.

### Option B (plan for after re:Invent): replace the controller

The Kubernetes project recommends Gateway API or another Ingress controller; AWS
recommends moving to the AWS Load Balancer Controller first (keep Ingress objects,
`ingressClassName: alb`), then Gateway API (AWS LBC v3.0 has GA Gateway API support).

| Candidate | Keeps nginx-annotated Ingress objects | cert-manager | TLS termination |
| --- | --- | --- | --- |
| AWS LBC (ALB Ingress / Gateway) | No. Class becomes `alb`; annotations rewritten to `alb.ingress.kubernetes.io/*` (ssl-redirect, transforms for rewrite). No proxy-body-size equivalent. | Not used. ALB terminates with ACM certs only; cert-manager Secrets are unusable. Needs a Route 53 wildcard or per-host ACM cert. | ALB + ACM |
| Traefik v3.7+ (`kubernetesIngressNGINX` provider, GA May 2026) | Yes. Provider defaults to IngressClass `nginx` / controller `k8s.io/ingress-nginx` and natively handles 85+ annotations incl. ssl-redirect, force-ssl-redirect, rewrite-target, use-regex, proxy-body-size, proxy-buffer-size. Snippets are not supported (good). | Yes. ingress-shim unchanged; HTTP-01 solver Ingress is class `nginx`, Traefik serves it. Gateway/HTTPRoute also supported (cert-manager Gateway support is beta since 1.15, `config.gatewayAPI.enabled`). | In-cluster, from Kubernetes TLS Secrets, behind an NLB like today |
| F5 NGINX Ingress Controller (`nginx.org`, Apache 2.0, free OSS, actively maintained by F5) | Partly. Ingress API kept but annotations must be converted to `nginx.org/*` (ssl-redirect, rewrite-target, proxy-buffer-size map; proxy-body-size becomes a ConfigMap key). Also defaults to class `nginx`, so side-by-side needs a rename. | Yes via Ingress TLS Secrets. | In-cluster |
| Envoy Gateway | No. Gateway API only (HTTPRoute); nginx annotations map to policy CRDs. | Gateway mode only (beta). | In-cluster |
| Kong / Cilium / Istio | Ingress API kept (classes `kong`, `cilium`, `istio`) but nginx annotations are ignored or must be rewritten; Cilium needs to be the CNI; Istio is heavy for a demo cluster. | Yes via Ingress. | In-cluster |

Recommendation: Traefik with the ingress-nginx provider. It is the only option that
keeps the existing Ingress objects, the nginx annotations in use here, the
`kubernetes.io/ingress.class: nginx` cert-manager flow and per-hostname Let's Encrypt
certs (no wildcard, no ACM) working, with a real NLB in front as today. Migration sketch:

```bash
# 1. Install Traefik in its own namespace with a second NLB, provider on, standard Ingress provider off
helm repo add traefik https://traefik.github.io/charts && helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace \
  --set providers.kubernetesIngressNginx.enabled=true \
  --set providers.kubernetesIngress.enabled=false \
  --set providers.kubernetesCRD.enabled=false \
  --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb
# 2. Both controllers now serve every nginx Ingress. Test one demo host against the new NLB
#    with curl --resolve, incl. HTTP->HTTPS redirect, rewrite paths, body size, cert chain.
# 3. Cut over in Route 53: point one demo record at the Traefik NLB, watch, then the rest.
#    If a host still has the legacy class annotation only, add spec.ingressClassName: nginx first.
# 4. Force one cert renewal (cmctl renew) to prove the HTTP-01 solver Ingress is served by Traefik.
# 5. helm uninstall ingress-nginx -n ingress-nginx; delete the namespace and the old NLB.
```

Open items to verify on the cluster before cutover: that the Traefik provider honours
Ingresses that carry only the deprecated `kubernetes.io/ingress.class` annotation
(Traefik docs show `ingressClassName`; if not, patch each Ingress), and the current
Traefik patch release (3.7.x was the latest line found; confirm on GitHub releases).

## 3. Verification commands

```bash
# Chart and image after Option A
helm list -n ingress-nginx                               # CHART ingress-nginx-4.15.1, APP VERSION 1.15.1
kubectl get deploy ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- /nginx-ingress-controller --version
# Hardening in effect
kubectl get cm -n ingress-nginx ingress-nginx-controller -o jsonpath='{.data.allow-snippet-annotations}{" "}{.data.annotations-risk-level}{"\n"}'
# Webhook listens on 8443 in the pod and is published only by a ClusterIP Service (443->8443)
kubectl get svc -n ingress-nginx ingress-nginx-controller-admission -o wide     # TYPE must be ClusterIP
kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{range .spec.ports[*]}{.port}{" "}{end}{"\n"}'  # 80 443 only
LB=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
nc -vz -w 5 "$LB" 8443 ; curl -sk --max-time 5 "https://$LB:8443/networking/v1/ingresses" -o /dev/null -w '%{http_code}\n'
# Expect connection refused / timeout. Also check the NLB listeners and node SG in the AWS console:
aws elbv2 describe-listeners --region us-east-1 --load-balancer-arn <nlb-arn> --query 'Listeners[].Port'
# Demos still work: TLS, redirect, cert
for h in togglewear.launchdarklydemos.com togglebank.launchdarklydemos.com; do
  curl -sI "http://$h/" | head -1; curl -sI "https://$h/" | head -1
  echo | openssl s_client -servername "$h" -connect "$h:443" 2>/dev/null | openssl x509 -noout -issuer -enddate
done
kubectl get certificate -A
```

What "done" looks like in Wiz: Wiz sets Issues to RESOLVED itself when the next scan
no longer finds the condition; Resolved cannot be set by hand (Open / In Progress /
Rejected are the manual options). The rescan interval is not published and docs.wiz.io
is login-gated, so the window is unconfirmed; check the Issue the day after rollout and
trigger a rescan from the workload page if the tenant allows it. The CVE controls stay
closed only until the next ingress-nginx CVE, which is the argument for Option B.

## 4. Sources

- Kubernetes: retirement https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/ , statement https://www.kubernetes.io/blog/2026/01/29/ingress-nginx-statement/ , ingress2gateway 1.0 https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release
- ingress-nginx: releases https://github.com/kubernetes/ingress-nginx/releases , README (versions table) https://github.com/kubernetes/ingress-nginx/blob/main/README.md , chart values https://github.com/kubernetes/ingress-nginx/blob/main/charts/ingress-nginx/README.md , upgrade https://kubernetes.github.io/ingress-nginx/deploy/upgrade/ , ConfigMap keys https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/
- CVEs: 2025-1974 https://github.com/kubernetes/kubernetes/issues/131009 (GHSA-mgvx-rpfc-9mpv); 2025-24514 /1097 /1098 /24513 issues 131006 /131007 /131008 /131005 in the same repo; 2026-24512 https://github.com/kubernetes/kubernetes/issues/136678 ; 2026-3288 https://github.com/kubernetes/kubernetes/issues/137560 ; 2026-4342 https://discuss.kubernetes.io/t/security-advisory-cve-2026-4342-ingress-nginx-comment-based-nginx-configuration-injection/34349 ; mitigations https://www.wiz.io/blog/ingress-nginx-kubernetes-vulnerabilities
- AWS (2026-03-27): https://aws.amazon.com/blogs/networking-and-content-delivery/navigating-the-nginx-ingress-retirement-a-practical-guide-to-migration-on-aws/
- Traefik: https://doc.traefik.io/traefik/reference/install-configuration/providers/kubernetes/kubernetes-ingress-nginx/ , https://doc.traefik.io/traefik/reference/routing-configuration/kubernetes/ingress-nginx/ , https://traefik.io/blog/traefik-proxy-3-7-is-available
- F5 NIC: https://blog.nginx.org/blog/the-ingress-nginx-alternative-open-source-nginx-ingress-controller-for-the-long-term , https://docs.nginx.com/nginx-ingress-controller/installation/ingress-nginx/
- cert-manager Gateway API: https://cert-manager.io/docs/usage/gateway/
- Wiz issue status (third party; Wiz docs login-gated): https://docs.blinkops.com/docs/integrations/wiz/actions/update-issue-status
