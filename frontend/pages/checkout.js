function renderCheckout(container) {
  const page = SkinManager.getPageContent('checkout');

  container.innerHTML = `
    <div class="container page" style="max-width:700px">
      <h1 class="section__title">${page.title}</h1>

      <section class="mt-xl">
        <h2 style="font-size:1.15rem; font-weight:600; margin-bottom: var(--spacing-md);">${page.shippingTitle}</h2>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" type="text" value="Robert" />
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input class="form-input" type="text" value="1 Embarcadero Center, Suite 1900" />
        </div>
        <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:var(--spacing-md)">
          <div class="form-group">
            <label class="form-label">City</label>
            <input class="form-input" type="text" value="San Francisco" />
          </div>
          <div class="form-group">
            <label class="form-label">State</label>
            <input class="form-input" type="text" value="CA" />
          </div>
          <div class="form-group">
            <label class="form-label">ZIP</label>
            <input class="form-input" type="text" value="94111" />
          </div>
        </div>
      </section>

      <section class="mt-xl">
        <h2 style="font-size:1.15rem; font-weight:600; margin-bottom: var(--spacing-md);">${page.paymentTitle}</h2>
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <input class="form-input" type="text" value="4111 1111 1111 1111" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--spacing-md)">
          <div class="form-group">
            <label class="form-label">Expiry</label>
            <input class="form-input" type="text" value="12/28" />
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input class="form-input" type="text" value="123" />
          </div>
        </div>
      </section>

      <button class="btn btn--primary mt-xl" onclick="Router.navigate('/confirmation')" style="width:100%">
        ${page.placeCta}
      </button>
    </div>
  `;
}
