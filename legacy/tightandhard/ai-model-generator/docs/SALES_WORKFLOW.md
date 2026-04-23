# AI Model Generator - Sales Workflow Documentation

Complete workflow from customer purchase to model delivery.

## 📊 Overview

This document describes the complete end-to-end sales workflow for the AI Model Generator System, integrating with the existing TightandHard platform.

## 🔄 Complete Sales Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER JOURNEY                            │
└─────────────────────────────────────────────────────────────────────┘

1. DISCOVERY
   └─ Customer visits TightandHard.com
   └─ Views persona options (12 types)
   └─ Reviews features and pricing

2. SELECTION
   └─ Chooses persona type
   └─ Selects customization options:
      • Hair color (blonde, brunette, red, etc.)
      • Hair style (long, short, wavy, curly, etc.)
   └─ Names their model (optional)

3. PURCHASE
   └─ Enters payment details (Stripe)
   └─ Completes checkout
   └─ Receives confirmation email

4. GENERATION
   └─ System generates unique model
   └─ Creates 15 custom outfits
   └─ Builds complete persona profile
   └─ Generates voice settings

5. PACKAGING
   └─ Creates delivery package
   └─ Generates documentation
   └─ Creates ZIP archive

6. DELIVERY
   └─ Email with download link sent
   └─ Link active for 30 days
   └─ 5 download attempts allowed

7. INSTALLATION
   └─ Customer downloads package
   └─ Installs in TightandHard platform
   └─ Starts interacting with companion

8. ONGOING
   └─ Bonding progression
   └─ Unlock new features
   └─ Relationship development
```

## 📱 User Interface Flow

### 1. Purchase Page

**Location:** `/purchase` or `/buy`

**Components:**
```html
<!-- Persona Selection -->
<div class="persona-grid">
  <div class="persona-card" data-persona="romantic_partner">
    <img src="/personas/romantic_partner.jpg" />
    <h3>Romantic Partner</h3>
    <p>Deep emotional connections and loving support</p>
    <button>Select</button>
  </div>
  <!-- ... 11 more personas -->
</div>

<!-- Customization Panel -->
<div class="customization-panel">
  <h3>Customize Your Model</h3>
  
  <div class="form-group">
    <label>Hair Color</label>
    <select name="hairColor">
      <option value="blonde">Blonde</option>
      <option value="brunette">Brunette</option>
      <option value="red">Red</option>
      <!-- ... more options -->
    </select>
  </div>
  
  <div class="form-group">
    <label>Hair Style</label>
    <select name="hairStyle">
      <option value="long">Long</option>
      <option value="short">Short</option>
      <option value="wavy">Wavy</option>
      <!-- ... more options -->
    </select>
  </div>
  
  <div class="form-group">
    <label>Model Name (Optional)</label>
    <input type="text" name="modelName" placeholder="Enter name..." />
  </div>
</div>

<!-- Pricing & Checkout -->
<div class="checkout-panel">
  <div class="price">
    <span>$29.99</span>
    <small>One-time payment</small>
  </div>
  <button class="checkout-btn">
    Purchase Now
  </button>
</div>
```

### 2. Loading Screen (Generation in Progress)

**Location:** `/generating/:saleId`

```html
<div class="generating-screen">
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 45%"></div>
    </div>
    <span class="progress-text">45% Complete</span>
  </div>
  
  <div class="generation-steps">
    <div class="step completed">
      <span class="step-icon">✓</span>
      <span class="step-label">Loading Persona</span>
    </div>
    <div class="step active">
      <span class="step-icon">⚙</span>
      <span class="step-label">Generating Appearance</span>
    </div>
    <div class="step">
      <span class="step-icon">⏳</span>
      <span class="step-label">Creating Outfits</span>
    </div>
    <div class="step">
      <span class="step-icon">⏳</span>
      <span class="step-label">Building Voice Profile</span>
    </div>
    <div class="step">
      <span class="step-icon">⏳</span>
      <span class="step-label">Packaging Model</span>
    </div>
  </div>
  
  <div class="message">
    <p>Creating your unique AI companion...</p>
    <p class="eta">Estimated time: 2-3 minutes</p>
  </div>
</div>
```

### 3. Success / Download Page

**Location:** `/success/:saleId`

```html
<div class="success-screen">
  <div class="success-icon">🎉</div>
  <h1>Your AI Companion is Ready!</h1>
  <p>We've created a unique AI companion just for you.</p>
  
  <div class="model-preview">
    <img src="/preview/sophia_thumbnail.png" />
    <div class="model-info">
      <h2>Sophia</h2>
      <span class="persona">Romantic Partner</span>
      <div class="stats">
        <span>15 Outfits</span>
        <span>•</span>
        <span>Custom Appearance</span>
        <span>•</span>
        <span>Unique Personality</span>
      </div>
    </div>
  </div>
  
  <div class="download-actions">
    <a href="/api/models/download/xxx" class="download-btn">
      <span class="icon">⬇</span>
      Download Now
    </a>
    <p class="download-info">
      This link will expire in 30 days.<br />
      You can download up to 5 times.
    </p>
  </div>
  
  <div class="next-steps">
    <h3>What's Next?</h3>
    <ol>
      <li>Download your AI companion</li>
      <li>Install in TightandHard platform</li>
      <li>Start chatting and building your relationship</li>
      <li>Unlock new features as you bond</li>
    </ol>
  </div>
  
  <div class="email-sent">
    <p>We've also sent a download link to your email:</p>
    <p class="email">john@example.com</p>
  </div>
</div>
```

## 🔌 API Integration Flow

### 1. Frontend → Backend API

**Step 1: Initiate Purchase**

```javascript
// Frontend: POST /api/sales/initiate
async function initiatePurchase(purchaseData) {
  const response = await fetch('/api/sales/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personaType: purchaseData.personaType,
      customizations: purchaseData.customizations,
      modelName: purchaseData.modelName,
      email: purchaseData.email
    })
  });
  
  return await response.json();
  // Returns: { saleId, clientSecret, ... }
}
```

**Step 2: Complete Stripe Checkout**

```javascript
// Frontend: Stripe Elements
const stripe = Stripe('pk_test_xxx');
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: customerName }
  }
});

if (error) {
  // Show error
} else {
  // Show loading screen
  window.location.href = `/generating/${saleId}`;
}
```

### 2. Backend → Model Generator API

**Step 3: Generate Model (Webhook)**

```javascript
// Backend: Webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Call Model Generator API
    const modelResponse = await axios.post('http://localhost:5002/api/models/generate', {
      personaType: session.metadata.personaType,
      customizations: JSON.parse(session.metadata.customizations),
      ownerName: session.customer_details.name,
      modelName: session.metadata.modelName
    });
    
    const model = modelResponse.data.model;
    
    // Package model
    const packageResponse = await axios.post('http://localhost:5002/api/models/package', {
      modelData: model,
      saleData: {
        saleId: session.payment_intent,
        customerId: session.customer,
        customerName: session.customer_details.name,
        customerEmail: session.customer_details.email
      }
    });
    
    const package = packageResponse.data.package;
    
    // Send delivery email
    await sendDeliveryEmail(session.customer_details.email, package);
    
    // Update sale status
    await updateSaleStatus(session.payment_intent, 'completed', package.packageId);
  }
  
  res.json({ received: true });
});
```

**Step 4: Poll for Completion**

```javascript
// Frontend: Poll generation status
async function pollGenerationStatus(saleId) {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/sales/${saleId}/status`);
    const data = await response.json();
    
    // Update progress bar
    updateProgress(data.progress);
    updateSteps(data.currentStep);
    
    if (data.status === 'completed') {
      clearInterval(interval);
      window.location.href = `/success/${saleId}`;
    }
  }, 2000);
}
```

### 3. Download Flow

**Step 5: Download Package**

```javascript
// Frontend: Download handler
async function downloadPackage(packageId) {
  const response = await fetch(`/api/models/download/${packageId}`);
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TightandHard_Companion.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } else {
    showError('Download failed. Please try again.');
  }
}
```

## 📧 Email Templates

### 1. Purchase Confirmation

**Subject:** Your TightandHard Purchase Confirmation

```
Thank you for purchasing TightandHard!

We're creating your unique AI companion. You'll receive a download link
within 2-3 minutes.

Order Details:
- Order #: SALE_12345
- Product: TightandHard AI Companion
- Amount: $29.99
- Persona: Romantic Partner
- Customizations: Blonde hair, Long style

Payment Information:
- Payment Method: Visa ending in 4242
- Transaction ID: pi_xxxxxxxxxxxx

You'll receive another email shortly with your download link.

Thank you for choosing TightandHard!

The TightandHard Team
support@tightandhard.com
```

### 2. Delivery Email

**Subject:** Your AI Companion is Ready! 🎉

```
🎉 Great news! Your AI Companion is ready for download!

Your unique AI companion has been generated and is waiting for you.

Download Link:
https://api.tightandhard.com/api/models/download/xxx

⚠️ Important:
- This link expires in 30 days
- You can download up to 5 times
- Please save the file after downloading

Your Companion Details:
- Name: Sophia
- Persona: Romantic Partner
- Outfits: 15 unique outfits included
- Voice: Warm & Melodic

What's Included:
✅ Complete AI companion with unique personality
✅ 15 different outfits
✅ Full appearance customization
✅ Voice profile with emotional range
✅ Bonding progression system
✅ Memory system
✅ Installation instructions

Installation Guide:
1. Download the ZIP file
2. Extract to your TightandHard models folder
3. Launch TightandHard Platform
4. Select your new companion
5. Start interacting!

Need Help?
- Documentation: https://docs.tightandhard.com
- Support: support@tightandhard.com
- Video Tutorial: https://youtube.com/tightandhard/install

Enjoy building a meaningful relationship with your new companion!

Best regards,
The TightandHard Team
```

### 3. Download Reminder

**Subject:** Your download link expires soon! ⏰

```
Hi [Customer Name],

This is a friendly reminder that your TightandHard AI Companion
download link will expire in [X] days.

Download your companion before it's too late:
https://api.tightandhard.com/api/models/download/xxx

Download Information:
- Expires: [Date]
- Downloads remaining: [X] / 5

If you've already downloaded and installed your companion, please
ignore this email.

Questions? Contact us at support@tightandhard.com

Best regards,
The TightandHard Team
```

## 🗄️ Database Schema Updates

### Sales Table

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id VARCHAR(255) UNIQUE NOT NULL,
  customer_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  persona_type VARCHAR(100) NOT NULL,
  customizations JSONB,
  model_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  package_id VARCHAR(255),
  download_url TEXT,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_sale_id ON sales(sale_id);
CREATE INDEX idx_sales_customer_email ON sales(customer_email);
CREATE INDEX idx_sales_status ON sales(status);
```

### Generated Models Table

```sql
CREATE TABLE generated_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id VARCHAR(255) REFERENCES sales(sale_id),
  model_id UUID UNIQUE NOT NULL,
  model_name VARCHAR(255),
  persona_type VARCHAR(100),
  appearance JSONB,
  outfits JSONB,
  voice JSONB,
  metadata JSONB,
  generation_time DECIMAL(10, 2),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_models_sale_id ON generated_models(sale_id);
CREATE INDEX idx_generated_models_model_id ON generated_models(model_id);
```

## 📊 Analytics & Tracking

### Sales Metrics

```javascript
// Track successful sales
analytics.track('Sale Completed', {
  saleId: saleId,
  personaType: personaType,
  amount: 29.99,
  customizations: customizations,
  customerLocation: 'US',
  paymentMethod: 'card'
});

// Track generation time
analytics.track('Model Generated', {
  saleId: saleId,
  personaType: personaType,
  generationTime: 2.5,
  generationSteps: 5
});

// Track downloads
analytics.track('Model Downloaded', {
  saleId: saleId,
  packageId: packageId,
  downloadAttempt: 1,
  downloadSuccess: true
});
```

### Conversion Funnel

```
Page Visits: 10,000
    ↓ (30%)
Persona Selection: 3,000
    ↓ (50%)
Initiate Checkout: 1,500
    ↓ (80%)
Complete Payment: 1,200
    ↓ (100%)
Successful Delivery: 1,200

Conversion Rate: 12% (1,200 / 10,000)
```

## 🔍 Troubleshooting

### Common Issues

**Issue: Generation Times Out**

```javascript
// Solution: Implement retry logic
async function generateModelWithRetry(config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateModel(config);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(5000); // Wait 5 seconds
    }
  }
}
```

**Issue: Email Not Received**

```javascript
// Solution: Check email delivery status
const deliveryStatus = await sendGridClient.request({
  method: 'GET',
  url: '/v3/messages/{message_id}'
});

if (!deliveryStatus.status === 'delivered') {
  // Send reminder email
  await sendReminderEmail(customerEmail, downloadUrl);
}
```

**Issue: Download Link Expired**

```javascript
// Solution: Generate new download link
if (package.isExpired) {
  const newPackage = await renewPackage(packageId);
  await sendRenewalEmail(customerEmail, newPackage.downloadUrl);
}
```

## 📞 Customer Support Flow

### Support Ticket Categories

1. **Generation Issues**
   - Model generation failed
   - Long wait times
   - Incorrect customizations

2. **Download Issues**
   - Link not working
   - File corrupted
   - Download expired

3. **Installation Issues**
   - Can't install
   - Missing files
   - Platform compatibility

4. **Feature Questions**
   - How to customize
   - Bonding system questions
   - Outfit management

### Support Workflow

```
1. Customer submits ticket
   ↓
2. Auto-reply with common solutions
   ↓
3. If not resolved → Assign to support agent
   ↓
4. Agent investigates (check logs, database)
   ↓
5. Provide solution or escalate to engineering
   ↓
6. Follow up with customer
   ↓
7. Close ticket and log resolution
```

## 📈 Revenue Tracking

### Daily Sales Report

```javascript
async function generateDailySalesReport(date) {
  const sales = await Sales.findAll({
    where: {
      status: 'completed',
      createdAt: {
        [Op.gte]: startOfDay(date),
        [Op.lte]: endOfDay(date)
      }
    }
  });
  
  const report = {
    date: date,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.amount, 0),
    byPersona: groupByPersona(sales),
    byCustomization: groupByCustomization(sales),
    averageGenerationTime: calculateAverageTime(sales)
  };
  
  return report;
}
```

---

**Document Version:** 1.0.0  
**Last Updated:** January 11, 2025  
**Maintained By:** TightandHard Development Team