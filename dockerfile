# Docker's official Node image, from Google's public mirror of Docker Hub.
# Amazon's public registry (public.ecr.aws) refuses anonymous pulls once a
# data limit shared by GitHub's runners is used up (429 toomanyrequests).
#
# Node 24 is the current LTS line. Keep the tag a major only, so each build
# picks up that line's latest patch and base image fixes.
ARG NODE_IMAGE=mirror.gcr.io/library/node:24-alpine

FROM ${NODE_IMAGE} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The only setting the build needs: the browser bundle inlines it. Everything
# the server reads (LD_SDK_KEY, LD_RESET_TOKEN, DEMO_API_SECRET,
# LD_PROJECT_KEY, AWS_REGION) arrives as the pod's environment at runtime, from
# a Kubernetes Secret and the Deployment, so no key is ever in the image.
ARG NEXT_PUBLIC_LD_CLIENT_KEY
ENV NEXT_PUBLIC_LD_CLIENT_KEY=${NEXT_PUBLIC_LD_CLIENT_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# The runtime stage carries only Next's standalone output: the server, the
# modules it traced as needed, and the static files. No devDependencies, no
# package manager. npm, npx, corepack and yarn ship inside the base image and
# are removed, because the npm CLI's own bundled dependencies are where most
# image scanner findings came from, and nothing here runs them.
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
            /usr/local/bin/corepack /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Numeric, so Kubernetes can check runAsNonRoot without reading /etc/passwd.
USER 1001

EXPOSE 3000

CMD ["node", "server.js"]
