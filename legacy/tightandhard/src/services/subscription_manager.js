/**
 * Subscription Manager - XPlus Package System
 * Monthly scene unlocks and premium features
 */

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.monthlyScenePacks = new Map();
    this.freeScenes = this.initializeFreeScenes();
    this.initializeMonthlyPacks();
  }
  
  initializeFreeScenes() {
    // 3 free scenes included with base package
    return [
      {
        id: 'cozy_fireplace_evening',
        name: 'Cozy Fireplace Evening',
        description: 'A warm living room with a crackling stone fireplace',
        isFree: true,
        tier: 'basic'
      },
      {
        id: 'breakfast_in_bed',
        name: 'Breakfast in Bed',
        description: 'A comfortable bedroom with morning sunlight',
        isFree: true,
        tier: 'basic'
      },
      {
        id: 'picnic_meadow',
        name: 'Picnic Meadow',
        description: 'A sunlit meadow filled with wildflowers',
        isFree: true,
        tier: 'basic'
      }
    ];
  }
  
  initializeMonthlyPacks() {
    // Monthly scene packs for XPlus subscribers
    const monthlyPacks = [
      {
        month: 1,
        name: 'Spring Romance Pack',
        scenes: [
          {
            id: 'moonlit_garden_stroll',
            name: 'Moonlit Garden Stroll',
            description: 'An enchanted garden path lined with blooming roses',
            thumbnail: '/scenes/spring/moonlit_garden.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'rainy_cabin_retreat',
            name: 'Rainy Cabin Retreat',
            description: 'A rustic wooden cabin surrounded by autumn colors',
            thumbnail: '/scenes/spring/rainy_cabin.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'spring_blossom_walk',
            name: 'Spring Blossom Walk',
            description: 'Walking through cherry blossoms in full bloom',
            thumbnail: '/scenes/spring/cherry_blossoms.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'premium_poses', 'enhanced_dialogue']
      },
      {
        month: 2,
        name: 'Summer Passion Pack',
        scenes: [
          {
            id: 'beach_sunset_romance',
            name: 'Beach Sunset Romance',
            description: 'Pristine beach during golden hour',
            thumbnail: '/scenes/summer/beach_sunset.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'rooftop_city_nights',
            name: 'Rooftop City Nights',
            description: 'Modern rooftop overlooking glittering cityscape',
            thumbnail: '/scenes/summer/rooftop.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'tropical_paradise',
            name: 'Tropical Paradise',
            description: 'Luxurious beachside villa with ocean views',
            thumbnail: '/scenes/summer/tropical.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'summer_outfits', 'beach_activities']
      },
      {
        month: 3,
        name: 'Autumn Intimacy Pack',
        scenes: [
          {
            id: 'candlelit_bath_sanctuary',
            name: 'Candlelit Bath Sanctuary',
            description: 'Luxurious bathroom with marble bathtub and candles',
            thumbnail: '/scenes/autumn/candlelit_bath.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'wine_cellar_tasting',
            name: 'Wine Cellar Tasting',
            description: 'Intimate wine cellar with vintage bottles',
            thumbnail: '/scenes/autumn/wine_cellar.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'harvest_moon_gathering',
            name: 'Harvest Moon Gathering',
            description: 'Cozy autumn evening under the harvest moon',
            thumbnail: '/scenes/autumn/harvest_moon.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'autumn_wardrobe', 'cozy_activities']
      },
      {
        month: 4,
        name: 'Winter Fantasy Pack',
        scenes: [
          {
            id: 'snow_cabin_cozy',
            name: 'Snow Cabin Cozy',
            description: 'Rustic mountain cabin with panoramic snow views',
            thumbnail: '/scenes/winter/snow_cabin.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'holiday_glamour_evening',
            name: 'Holiday Glamour Evening',
            description: 'Elegant winter celebration with formal attire',
            thumbnail: '/scenes/winter/holiday_glamour.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'northern_lights_watching',
            name: 'Northern Lights Watching',
            description: 'Arctic viewing of aurora borealis under stars',
            thumbnail: '/scenes/winter/northern_lights.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'winter_luxury', 'snow_activities']
      },
      {
        month: 5,
        name: 'Urban Adventures Pack',
        scenes: [
          {
            id: 'penthouse_suite_night',
            name: 'Penthouse Suite Night',
            description: 'Luxury penthouse with city skyline views',
            thumbnail: '/scenes/urban/penthouse.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'jazz_club_intimate',
            name: 'Jazz Club Intimate',
            description: 'Private corner in dimly lit jazz club',
            thumbnail: '/scenes/urban/jazz_club.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'rooftop_hot_tub',
            name: 'Rooftop Hot Tub',
            description: 'Private hot tub under the stars in the city',
            thumbnail: '/scenes/urban/hot_tub.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'urban_fashion', 'nightlife_experiences']
      },
      {
        month: 6,
        name: 'Exotic Getaways Pack',
        scenes: [
          {
            id: 'private_yacht_sunset',
            name: 'Private Yacht Sunset',
            description: 'Luxury yacht on Mediterranean waters',
            thumbnail: '/scenes/exotic/yacht.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'desert_oasis_night',
            name: 'Desert Oasis Night',
            description: 'Luxury tent under desert stars',
            thumbnail: '/scenes/exotic/desert_oasis.jpg',
            unlockLevel: 'xplus'
          },
          {
            id: 'mountain_retreat_spa',
            name: 'Mountain Retreat Spa',
            description: 'Private spa in Swiss mountain resort',
            thumbnail: '/scenes/exotic/mountain_spa.jpg',
            unlockLevel: 'xplus'
          }
        ],
        price: 19.99,
        features: ['3_new_scenes', 'vacation_wardrobe', 'luxury_activities']
      }
    ];
    
    monthlyPacks.forEach(pack => {
      this.monthlyScenePacks.set(pack.month, pack);
    });
  }
  
  // Subscription Management
  subscribe(userId, tier = 'basic') {
    const subscription = {
      userId,
      tier,
      startDate: new Date(),
      isActive: true,
      unlockedScenes: tier === 'xplus' ? this.getAllSceneIds() : this.freeScenes.map(s => s.id),
      monthlyPacksUnlocked: tier === 'xplus' ? [1] : []
    };
    
    this.subscriptions.set(userId, subscription);
    return subscription;
  }
  
  upgradeToXPlus(userId) {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return null;
    
    subscription.tier = 'xplus';
    subscription.unlockedScenes = this.getAllSceneIds();
    subscription.monthlyPacksUnlocked = [1];
    subscription.upgradeDate = new Date();
    
    return subscription;
  }
  
  unlockMonthlyPack(userId, month) {
    const subscription = this.subscriptions.get(userId);
    if (!subscription || subscription.tier !== 'xplus') {
      return { success: false, message: 'XPlus subscription required' };
    }
    
    const pack = this.monthlyScenePacks.get(month);
    if (!pack) {
      return { success: false, message: 'Pack not found' };
    }
    
    if (!subscription.monthlyPacksUnlocked.includes(month)) {
      subscription.monthlyPacksUnlocked.push(month);
      subscription.monthlyPacksUnlocked.sort();
    }
    
    return { success: true, pack };
  }
  
  // Scene Access
  getAvailableScenes(userId) {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      return this.freeScenes;
    }
    
    const availableSceneIds = subscription.unlockedScenes;
    return this.getAllScenes().filter(scene => 
      availableSceneIds.includes(scene.id)
    );
  }
  
  getAllSceneIds() {
    const freeIds = this.freeScenes.map(s => s.id);
    const premiumIds = [];
    
    this.monthlyScenePacks.forEach(pack => {
      pack.scenes.forEach(scene => {
        premiumIds.push(scene.id);
      });
    });
    
    return [...freeIds, ...premiumIds];
  }
  
  getAllScenes() {
    const scenes = [...this.freeScenes];
    
    this.monthlyScenePacks.forEach(pack => {
      pack.scenes.forEach(scene => {
        scenes.push({
          ...scene,
          month: pack.month,
          packName: pack.name,
          price: pack.price
        });
      });
    });
    
    return scenes;
  }
  
  getMonthlyPack(month) {
    return this.monthlyScenePacks.get(month) || null;
  }
  
  getAllMonthlyPacks() {
    return Array.from(this.monthlyScenePacks.values());
  }
  
  // Pricing
  getSubscriptionPrice(tier) {
    const prices = {
      'basic': 0,
      'xplus': 19.99
    };
    return prices[tier] || 0;
  }
  
  calculateMonthlyRevenue(userId) {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return 0;
    
    return this.getSubscriptionPrice(subscription.tier);
  }
}

module.exports = { SubscriptionManager };