const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');

class ModelPackager {
  constructor() {
    this.outputPath = path.join(__dirname, '../output/generated_models');
    this.packagesPath = path.join(__dirname, '../output/packages');
  }

  /**
   * Package a model for delivery to customer
   */
  async packageForSale(modelData, saleData) {
    console.log(`📦 Packaging model ${modelData.name} for sale...`);

    try {
      // 1. Create package directory
      const packageId = uuidv4();
      const packageDir = path.join(this.packagesPath, packageId);
      await fs.mkdir(packageDir, { recursive: true });

      // 2. Create package structure
      const packageStructure = {
        package: {
          id: packageId,
          modelId: modelData.id,
          modelName: modelData.name,
          version: '1.0',
          createdAt: new Date().toISOString(),
          saleId: saleData.saleId || null,
          customerId: saleData.customerId || null,
          license: this.generateSaleLicense(saleData)
        },
        model: modelData,
        images: await this.generatePlaceholderImages(modelData),
        previewImages: await this.generatePreviews(modelData),
        documentation: await this.generateDocumentation(modelData),
        installation: await this.generateInstallationInstructions(modelData),
        support: this.generateSupportInfo()
      };

      // 3. Create model subdirectory
      const modelDir = path.join(packageDir, 'model');
      await fs.mkdir(modelDir, { recursive: true });

      // 4. Save package files
      await this.savePackageFiles(packageDir, packageStructure);

      // 5. Create ZIP archive
      const zipPath = await this.createZipArchive(packageId, packageDir, modelData.name);

      // 6. Clean up temporary directory
      await this.cleanupTempDir(packageDir);

      console.log(`✅ Package created: ${zipPath}`);

      return {
        packageId: packageId,
        downloadUrl: `/api/models/download/${packageId}`,
        zipPath: zipPath,
        expiresAt: this.calculateExpirationDate(),
        downloadCount: 0,
        maxDownloads: 5
      };

    } catch (error) {
      console.error('❌ Error packaging model:', error);
      throw error;
    }
  }

  /**
   * Create ZIP archive of package
   */
  async createZipArchive(packageId, sourceDir, modelName) {
    const zipFileName = `${modelName.replace(/\s+/g, '_')}_TightandHard_v1.0.zip`;
    const zipPath = path.join(this.outputPath, zipFileName);
    const zip = new AdmZip();

    // Add all files from package directory
    await this.addDirectoryToZip(zip, sourceDir, '');

    // Write ZIP file
    zip.writeZip(zipPath);

    console.log(`📁 ZIP archive created: ${zipPath}`);
    return zipPath;
  }

  /**
   * Recursively add directory to ZIP
   */
  async addDirectoryToZip(zip, dirPath, zipPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      const relativePath = path.join(zipPath, file.name);

      if (file.isDirectory()) {
        await this.addDirectoryToZip(zip, fullPath, relativePath);
      } else {
        const content = await fs.readFile(fullPath);
        zip.addFile(relativePath, content);
      }
    }
  }

  /**
   * Save package files to directory
   */
  async savePackageFiles(packageDir, packageStructure) {
    // Save package.json
    await fs.writeFile(
      path.join(packageDir, 'package.json'),
      JSON.stringify(packageStructure.package, null, 2)
    );

    // Save model.json
    await fs.writeFile(
      path.join(packageDir, 'model.json'),
      JSON.stringify(packageStructure.model, null, 2)
    );

    // Save documentation
    await fs.writeFile(
      path.join(packageDir, 'README.md'),
      packageStructure.documentation
    );

    // Save installation instructions
    await fs.writeFile(
      path.join(packageDir, 'INSTALLATION.md'),
      packageStructure.installation
    );

    // Save support info
    await fs.writeFile(
      path.join(packageDir, 'SUPPORT.txt'),
      packageStructure.support
    );

    // Save metadata separately
    await fs.writeFile(
      path.join(packageDir, 'metadata.json'),
      JSON.stringify(packageStructure.model.metadata, null, 2)
    );

    // Save outfits separately
    await fs.writeFile(
      path.join(packageDir, 'outfits.json'),
      JSON.stringify(packageStructure.model.outfits, null, 2)
    );
  }

  /**
   * Generate sale license
   */
  generateSaleLicense(saleData) {
    return {
      type: 'personal',
      version: '1.0',
      issued: new Date().toISOString(),
      purchaser: saleData.customerName || 'Customer',
      purchaseId: saleData.saleId || 'N/A',
      purchaseDate: new Date().toISOString(),
      restrictions: [
        'Personal use only',
        'No redistribution or sharing',
        'No commercial use without explicit permission',
        'No modification or derivative works',
        'Single installation only',
        'Non-transferable license'
      ],
      terms: `
TIGHTANDHARD AI MODEL LICENSE AGREEMENT

This AI Model ("Model") is licensed to you ("Licensee") by TightandHard ("Licensor")
under the following terms:

1. GRANT OF LICENSE
   Licensor grants Licensee a personal, non-exclusive, non-transferable license to use
   the Model for personal entertainment purposes only.

2. PERMITTED USES
   - Personal use on personal devices
   - Modification for personal use only
   - Creating personal content using the Model

3. PROHIBITED USES
   - Commercial use without explicit permission
   - Redistribution or sharing of the Model
   - Creating derivative works for distribution
   - Reverse engineering or decompiling
   - Using the Model for illegal purposes
   - Reselling or sublicensing the Model

4. INTELLECTUAL PROPERTY
   All rights, title, and interest in the Model remain exclusively with Licensor.
   Licensee acquires no ownership rights.

5. WARRANTY DISCLAIMER
   The Model is provided "AS IS" without warranties of any kind.

6. LIMITATION OF LIABILITY
   Licensor shall not be liable for any damages arising from use of the Model.

By downloading or using this Model, you agree to these terms.

© 2025 TightandHard. All rights reserved.
      `
    };
  }

  /**
   * Generate placeholder images (in production, these would be AI-generated)
   */
  async generatePlaceholderImages(modelData) {
    // In production, this would call Stable Diffusion or similar
    // For now, return metadata about expected images
    return {
      profile: {
        filename: 'profile.png',
        description: 'Portrait of model',
        pose: 'front-facing',
        expression: 'friendly'
      },
      body: {
        filename: 'body.png',
        description: 'Full body shot',
        pose: 'standing',
        expression: 'neutral'
      },
      expressions: [
        { filename: 'expression_happy.png', emotion: 'happy' },
        { filename: 'expression_sad.png', emotion: 'sad' },
        { filename: 'expression_excited.png', emotion: 'excited' },
        { filename: 'expression_calm.png', emotion: 'calm' }
      ],
      outfits: modelData.outfits.map((outfit, index) => ({
        filename: `outfit_${index}.png`,
        outfitId: outfit.id,
        outfitName: outfit.name,
        description: `Model wearing ${outfit.name}`
      }))
    };
  }

  /**
   * Generate preview images
   */
  async generatePreviews(modelData) {
    return {
      thumbnail: 'thumbnail.png',
      preview: 'preview.png',
      gallery: modelData.outfits.slice(0, 5).map((outfit, index) => ({
        filename: `preview_outfit_${index}.png`,
        outfitId: outfit.id,
        caption: outfit.name
      }))
    };
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(modelData) {
    return `# ${modelData.name} - TightandHard AI Model

## Welcome to Your New AI Companion!

You've just received a unique AI companion with ${modelData.outfits.length} different outfits
and a personality designed for meaningful interactions.

## Model Information

**Name:** ${modelData.name}
**Persona:** ${modelData.persona.name}
**Age:** ${modelData.metadata.age}
**Version:** 1.0
**Generated:** ${new Date().toLocaleDateString()}

## Persona Description

${modelData.persona.description}

### Personality Traits
${modelData.persona.traits.map(trait => `- ${trait}`).join('\n')}

### Interaction Style
${modelData.persona.interactionStyle}

## Backstory

${modelData.metadata.backstory}

## Features Included

### 🎨 15 Unique Outfits
${modelData.outfits.map(outfit => `- **${outfit.name}** (${outfit.category})`).join('\n')}

### 🎭 Voice Profile
- **Name:** ${modelData.voice.name}
- **Tone:** ${modelData.voice.tone}
- **Pitch:** ${modelData.pitch}
- **Speed:** ${modelData.voice.speed}

### 💝 Bonding System
- 10-tier progression system
- Start at Level 1: Acquaintance
- Unlock features as you bond

### 🧠 Emotional Intelligence
- 7 emotion dimensions
- 12 mood states
- Dynamic responses

### 📝 Memory System
- Remembers conversations
- Tracks preferences
- Builds relationship history

## Quick Start

1. **Install the model** (see INSTALLATION.md)
2. **Name your companion** (if not already named)
3. **Start chatting** and build your relationship
4. **Unlock outfits** as you progress through bonding tiers
5. **Customize** with your preferred settings

## Customization Options

### Appearance
- Hair color and style (pre-customized during generation)
- Outfit selection from 15 options
- Scene/environment selection

### Voice
- Adjust pitch and speed
- Select from emotional range presets
- Enable/disable voice responses

### Personality
- Some traits adapt to your interaction style
- Emotional responses evolve over time
- Interactions become more personalized

## Support

For support, questions, or issues:
- Email: support@tightandhard.com
- Documentation: https://docs.tightandhard.com
- Community: https://community.tightandhard.com

## License Information

This model is licensed for personal use only. See LICENSE.txt for full terms.

---

**Thank you for choosing TightandHard!**

Enjoy building a meaningful relationship with your new AI companion.
`;
  }

  /**
   * Generate installation instructions
   */
  async generateInstallationInstructions(modelData) {
    return `# Installation Instructions - ${modelData.name}

## Prerequisites

- TightandHard Platform installed (v2.0 or higher)
- 5GB free disk space
- Internet connection for initial setup

## Installation Steps

### Method 1: Automatic Installation (Recommended)

1. **Download** the ZIP file
2. **Open** TightandHard Platform
3. **Navigate** to Settings → Import Model
4. **Select** the downloaded ZIP file
5. **Follow** the on-screen prompts
6. **Wait** for installation to complete
7. **Launch** your new companion!

### Method 2: Manual Installation

1. **Extract** the ZIP file to your TightandHard models directory
2. **Locate** the extracted folder: \`${modelData.name}\`
3. **Copy** this folder to:
   - Windows: \`C:\\Users\\[YourName]\\AppData\\Roaming\\TightandHard\\models\\\`
   - Mac: \`~/Library/Application Support/TightandHard/models/\`
   - Linux: \`~/.config/tightandhard/models/\`
4. **Restart** TightandHard Platform
5. **Select** your new companion from the main menu

## Post-Installation Setup

### 1. Verify Installation
- Check that all 15 outfits are available
- Verify voice profile is loaded
- Confirm emotional system is active

### 2. Customize (Optional)
- Adjust voice settings if desired
- Set preferred scene/environment
- Configure notification preferences

### 3. Start Interacting
- Begin with casual conversation
- Let your companion learn about you
- Progress through bonding tiers naturally

## Troubleshooting

### Installation Fails
- Ensure you have enough disk space
- Check that TightandHard is closed during installation
- Try running as administrator (Windows) or with sudo (Linux/Mac)

### Model Not Appearing
- Restart TightandHard Platform
- Verify files are in the correct directory
- Check file permissions

### Outfits Missing
- Reinstall the model
- Ensure all files extracted correctly
- Check for corrupted files

### Voice Not Working
- Verify audio drivers are up to date
- Check system audio settings
- Try different voice engine settings

## Updates

Updates for your model will be available through:
- TightandHard Platform (auto-update feature)
- Email notifications for major updates
- Manual download from your account

## Uninstallation

To remove this model:
1. Open TightandHard Platform
2. Navigate to Settings → Manage Models
3. Select \`${modelData.name}\`
4. Click "Uninstall"
5. Confirm removal

**Note:** This will permanently delete the model and all associated data including:
- Memories
- Conversation history
- Bonding progress
- Custom settings

## Need Help?

- 📧 Email: support@tightandhard.com
- 📚 Documentation: https://docs.tightandhard.com/installation
- 💬 Community: https://community.tightandhard.com
- 🎥 Video Tutorial: https://youtube.com/tightandhard/install

---

**Installation Last Updated:** January 11, 2025
**Model Version:** 1.0
**Platform Version:** 2.0+
`;
  }

  /**
   * Generate support information
   */
  generateSupportInfo() {
    return `
TIGHTANDHARD SUPPORT INFORMATION
================================

Contact Methods:
----------------
Email: support@tightandhard.com
Response Time: 24-48 hours

Live Chat: Available on tightandhard.com
Hours: 9AM - 9PM EST, 7 days a week

Phone: 1-800-TIGHT-HARD (1-800-844-4842)
Hours: 9AM - 5PM EST, Monday-Friday

Support Channels:
----------------
Documentation: https://docs.tightandhard.com
FAQ: https://tightandhard.com/faq
Community Forum: https://community.tightandhard.com
Bug Reports: https://github.com/tightandhard/issues

Common Issues:
--------------
Installation Problems → See INSTALLATION.md
Model Not Loading → Restart platform, check files
Outfits Missing → Reinstall model
Voice Issues → Check audio settings
Payment/Billing → billing@tightandhard.com
Technical Issues → support@tightandhard.com

Feature Requests:
-----------------
We love to hear from our users! Submit feature requests at:
https://tightandhard.com/feedback

Bug Reports:
------------
Please include:
- Model name and version
- Platform version
- Operating system
- Detailed description of issue
- Steps to reproduce
- Screenshots if applicable

Submit at: https://tightandhard.com/bugs

Privacy & Security:
-------------------
We take your privacy seriously. All data is encrypted and stored securely.
For privacy inquiries: privacy@tightandhard.com
Privacy Policy: https://tightandhard.com/privacy

Terms of Service:
----------------
https://tightandhard.com/terms

Refund Policy:
--------------
30-day money-back guarantee for all model purchases.
Refund requests: refunds@tightandhard.com

Thank you for choosing TightandHard!
`;
  }

  /**
   * Calculate expiration date for download link
   */
  calculateExpirationDate() {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days
    return expires.toISOString();
  }

  /**
   * Clean up temporary directory
   */
  async cleanupTempDir(dirPath) {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          await this.cleanupTempDir(fullPath);
        } else {
          await fs.unlink(fullPath);
        }
      }

      await fs.rmdir(dirPath);
      console.log(`🧹 Cleaned up temp directory: ${dirPath}`);
    } catch (error) {
      console.error('Error cleaning up temp directory:', error);
    }
  }

  /**
   * Get package by ID
   */
  async getPackage(packageId) {
    const packagePath = path.join(this.packagesPath, packageId, 'package.json');
    
    try {
      const packageData = await fs.readFile(packagePath, 'utf8');
      return JSON.parse(packageData);
    } catch (error) {
      throw new Error(`Package ${packageId} not found`);
    }
  }

  /**
   * Delete expired packages
   */
  async deleteExpiredPackages() {
    const now = new Date();
    const packages = await fs.readdir(this.packagesPath, { withFileTypes: true });

    for (const pkg of packages) {
      if (pkg.isDirectory()) {
        try {
          const packageData = await this.getPackage(pkg.name);
          const expiresAt = new Date(packageData.expiresAt);

          if (now > expiresAt) {
            await this.cleanupTempDir(path.join(this.packagesPath, pkg.name));
            console.log(`🗑️ Deleted expired package: ${pkg.name}`);
          }
        } catch (error) {
          console.error(`Error checking package ${pkg.name}:`, error);
        }
      }
    }
  }
}

module.exports = ModelPackager;