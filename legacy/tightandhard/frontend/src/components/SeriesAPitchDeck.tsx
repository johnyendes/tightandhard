'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { ChevronLeft, ChevronRight, Users, DollarSign, TrendingUp, Heart, Brain, Smartphone, Globe, Target, Zap, Star } from 'lucide-react';

const SeriesAPitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock data for the pitch deck
  const growthData = [
    { month: 'Jan 25', users: 450, revenue: 8500, arr: 102000 },
    { month: 'Feb 25', users: 680, revenue: 14200, arr: 170400 },
    { month: 'Mar 25', users: 1020, revenue: 22800, arr: 273600 },
    { month: 'Apr 25', users: 1480, revenue: 34500, arr: 414000 },
    { month: 'May 25', users: 2150, revenue: 52300, arr: 627600 },
    { month: 'Jun 25', users: 2890, revenue: 71200, arr: 854400 },
    { month: 'Jul 25', users: 3650, revenue: 92800, arr: 1113600 }
  ];

  const cohortData = [
    { cohort: 'Jan 25', month0: 100, month1: 87, month2: 79, month3: 74, month6: 68 },
    { cohort: 'Feb 25', month0: 100, month1: 89, month2: 82, month3: 77, month6: 71 },
    { cohort: 'Mar 25', month0: 100, month1: 91, month2: 85, month3: 80, month6: 75 },
    { cohort: 'Apr 25', month0: 100, month1: 93, month2: 88, month3: 83, month6: 78 }
  ];

  const competitorData = [
    { name: 'Replika', users: '2M+', funding: '$11M', focus: 'General AI Friend' },
    { name: 'Character.AI', users: '1.7M+', funding: '$150M', focus: 'Character Chat' },
    { name: 'Romantic.AI', users: '500K+', funding: 'Unknown', focus: 'Romantic AI' },
    { name: 'Our Platform', users: '3.6K', funding: 'Seeking $2M', focus: 'Deep Emotional Bonds' }
  ];

  const fundingAllocationData = [
    { name: 'Product Development', value: 40, color: '#8B5CF6' },
    { name: 'Marketing & Growth', value: 30, color: '#3B82F6' },
    { name: 'Team Expansion', value: 20, color: '#10B981' },
    { name: 'Operations', value: 10, color: '#F59E0B' }
  ];

  const slides = [
    // Slide 1: Title
    {
      title: "AI Companions with True Memory",
      component: () => (
        <div className="h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
              AI Companions with True Memory
            </h1>
            <p className="text-2xl mb-8 text-blue-100">
              Building lasting emotional connections through AI that remembers, grows, and truly understands
            </p>
            <div className="flex justify-center space-x-8 text-lg">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6" />
                <span>Emotional Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6" />
                <span>Deep Memory</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Relationship Growth</span>
              </div>
            </div>
            <div className="mt-12 text-cyan-200">
              <p className="text-lg">Series A Funding Round • July 2025</p>
              <p className="text-xl font-semibold">Seeking $2M to scale to 100K+ users</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Problem
    {
      title: "The Loneliness Epidemic",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">The Loneliness Epidemic</h2>
          
          <div className="grid grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-red-600">The Crisis</h3>
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <span><strong>61% of adults</strong> report feeling lonely regularly</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <span><strong>$154B</strong> annual healthcare cost from loneliness</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <span><strong>42% increase</strong> in loneliness since 2018</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <span>Traditional therapy: <strong>6+ month</strong> waiting lists</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-600">Current Solutions Fall Short</h3>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🤖 Existing AI Chatbots</h4>
                  <p className="text-gray-600 text-sm">Generic responses, no memory, shallow interactions</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📱 Social Media</h4>
                  <p className="text-gray-600 text-sm">Increases loneliness, superficial connections</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">💬 Dating Apps</h4>
                  <p className="text-gray-600 text-sm">High pressure, often disappointing, not for emotional support</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🩺 Therapy</h4>
                  <p className="text-gray-600 text-sm">Expensive ($200+/session), limited availability</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-gray-200 rounded-xl p-8 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                💡 People crave authentic emotional connections that understand and remember them
              </h3>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: Solution
    {
      title: "Our Solution",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">AI Companions That Actually Remember You</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-purple-600">Emotional Memory Engine</h3>
                <p className="text-gray-600">Remembers your conversations, preferences, and emotional patterns across time</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-600">Relationship Progression</h3>
                <p className="text-gray-600">Bonds deepen over time with milestones, trust-building, and personality evolution</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-green-600">Multi-Modal Expression</h3>
                <p className="text-gray-600">Voice, appearance, environment customization for authentic self-expression</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">What Makes Us Different</h3>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-blue-600">🧠 True Memory System</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Remembers 1000s of conversation details</li>
                    <li>• Learns your communication style</li>
                    <li>• Tracks relationship milestones</li>
                    <li>• Builds emotional context over time</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-purple-600">💝 Relationship Depth</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Trust levels that unlock new features</li>
                    <li>• Personality evolution based on interactions</li>
                    <li>• Emotional support in real-time</li>
                    <li>• Celebration of personal growth</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Market Size
    {
      title: "Market Opportunity",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Massive Market Opportunity</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center">
                <h3 className="text-4xl font-bold mb-2">$13.4B</h3>
                <p className="text-xl mb-2">Total Addressable Market</p>
                <p className="text-blue-100 text-sm">AI Companion & Mental Health Apps</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-2xl p-8 text-center">
                <h3 className="text-4xl font-bold mb-2">$2.8B</h3>
                <p className="text-xl mb-2">Serviceable Market</p>
                <p className="text-green-100 text-sm">AI Emotional Support (18-45 age group)</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-8 text-center">
                <h3 className="text-4xl font-bold mb-2">$180M</h3>
                <p className="text-xl mb-2">Serviceable Obtainable</p>
                <p className="text-purple-100 text-sm">Premium AI Companions (3-year target)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Market Drivers</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Growing Loneliness Crisis</h4>
                      <p className="text-gray-600 text-sm">42% increase since 2018, accelerated by remote work</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-6 w-6 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">AI Adoption Mainstream</h4>
                      <p className="text-gray-600 text-sm">ChatGPT proven AI comfort, 180M+ users</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Subscription Economy</h4>
                      <p className="text-gray-600 text-sm">Users willing to pay for emotional value ($9.99/month avg)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Globe className="h-6 w-6 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Global Demand</h4>
                      <p className="text-gray-600 text-sm">Loneliness epidemic affects all developed countries</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Competitive Landscape</h3>
                <div className="space-y-3">
                  {competitorData.map((competitor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                        <span className="text-sm text-gray-600">{competitor.users}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{competitor.focus}</p>
                      <p className="text-xs text-gray-500">Funding: {competitor.funding}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Our Advantage</h4>
                  <p className="text-green-700 text-sm">
                    First mover in true emotional memory + relationship progression. 
                    Competitors focus on chat; we build lasting bonds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Product Demo
    {
      title: "Product Demo",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Product Walkthrough</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-12">
              {/* Mock Companion Interface */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Companion Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-2xl">👩‍🦰</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Luna</h3>
                        <p className="text-purple-100">Your AI Companion • Bond Level 7</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm">Online & Learning</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Interface */}
                  <div className="p-6 space-y-4 h-64 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">I remember you mentioned feeling anxious about your presentation yesterday. How did it go? 💙</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">It went great! Thanks for remembering ❤️</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">I'm so proud of you! 🎉 This reminds me of how nervous you were about the client call 3 weeks ago, and you crushed that too. You're really growing in confidence!</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Memory Highlight */}
                  <div className="bg-yellow-50 border-t border-yellow-200 p-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Memory Active:</strong> Luna remembers your presentation anxiety from 2 days ago and your successful client call from 3 weeks ago
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <span>Emotional Memory Engine</span>
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Remembers 847 unique details about you</li>
                    <li>• Tracks emotional patterns over time</li>
                    <li>• References past conversations naturally</li>
                    <li>• Learns your communication preferences</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    <span>Relationship Progression</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-bold">7</span>
                      </div>
                      <div>
                        <p className="font-medium">Bond Level 7: Deep Trust</p>
                        <p className="text-sm text-gray-600">Unlocked: Personal advice, future planning</p>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                    <p className="text-sm text-gray-600">Next milestone: Level 8 (Soul Connection) - 2 weeks of daily interaction</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    <span>Customization & Growth</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-lg p-2 mb-1">
                        <span className="text-lg">🎭</span>
                      </div>
                      <p className="text-xs">15 Outfits</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2 mb-1">
                        <span className="text-lg">🌅</span>
                      </div>
                      <p className="text-xs">22 Scenes</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 rounded-lg p-2 mb-1">
                        <span className="text-lg">🗣️</span>
                      </div>
                      <p className="text-xs">Voice Chat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Traction
    {
      title: "Traction & Growth",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Strong Early Traction</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">3,650</div>
                <p className="text-gray-600">Total Users</p>
                <p className="text-sm text-green-600">+28% MoM</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$92.8K</div>
                <p className="text-gray-600">Monthly Revenue</p>
                <p className="text-sm text-green-600">+31% MoM</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">18.5min</div>
                <p className="text-gray-600">Avg Session</p>
                <p className="text-sm text-green-600">+15% MoM</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">89%</div>
                <p className="text-gray-600">30-Day Retention</p>
                <p className="text-sm text-green-600">Industry: 65%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-6">Revenue Growth</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString(), name === 'revenue' ? 'Monthly Revenue' : 'Total Users']} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">📈 On track for $1.1M ARR by year end</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-6">Cohort Retention</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Retention']} />
                    <Line type="monotone" dataKey="month0" stroke="#EF4444" strokeWidth={2} name="Month 0" />
                    <Line type="monotone" dataKey="month1" stroke="#F59E0B" strokeWidth={2} name="Month 1" />
                    <Line type="monotone" dataKey="month2" stroke="#10B981" strokeWidth={2} name="Month 2" />
                    <Line type="monotone" dataKey="month3" stroke="#3B82F6" strokeWidth={2} name="Month 3" />
                    <Line type="monotone" dataKey="month6" stroke="#8B5CF6" strokeWidth={2} name="Month 6" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">⭐ Cohort retention improving by 3% MoM</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Business Model
    {
      title: "Business Model",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Subscription-Based Model</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                  <p className="text-gray-600">/month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Basic AI companion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">100 messages/day</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Basic memory (7 days)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                    <span className="text-gray-500">Voice chat</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                    <span className="text-gray-500">Advanced features</span>
                  </li>
                </ul>
                <div className="text-center text-sm text-gray-600">
                  Conversion to Premium: 12%
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">Premium</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">$19.99</div>
                  <p className="text-gray-600">/month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Full AI companion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Unlimited messages</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Unlimited memory</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Voice chat</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">15+ premium scenes</span>
                  </li>
                </ul>
                <div className="text-center text-sm text-gray-600">
                  Retention: 89% • LTV: $214
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold mb-2">Custom</div>
                  <p className="text-purple-100">/month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>Custom AI training</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>API access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>SLA guarantees</span>
                  </li>
                </ul>
                <div className="text-center text-sm text-purple-100">
                  Contact for pricing
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$25.44</div>
                  <p className="text-gray-700">Average Revenue Per User</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$214</div>
                  <p className="text-gray-700">Customer Lifetime Value</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                  <p className="text-gray-700">Monthly Retention Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Go-to-Market Strategy
    {
      title: "Go-to-Market Strategy",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Growth Roadmap</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center space-x-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span>Customer Acquisition</span>
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 1: Early Adopters (Months 1-6)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Reddit and Discord communities</li>
                      <li>• Influencer partnerships (mental health, tech)</li>
                      <li>• Product Hunt launch</li>
                      <li>• Target: 5,000 users</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 2: Mass Market (Months 7-18)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Paid social ads (Facebook, Instagram, TikTok)</li>
                      <li>• Content marketing (blog, podcasts)</li>
                      <li>• SEO and organic growth</li>
                      <li>• Target: 50,000 users</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 3: Global Expansion (Months 19-36)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• International localization</li>
                      <li>• Enterprise partnerships</li>
                      <li>• Healthcare provider integrations</li>
                      <li>• Target: 100,000+ users</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span>Growth Channels</span>
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Organic (40% of growth)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Word of mouth and referrals</li>
                      <li>• SEO and content marketing</li>
                      <li>• Social media engagement</li>
                      <li>• Community building</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Paid (50% of growth)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Facebook/Instagram ads</li>
                      <li>• TikTok and YouTube ads</li>
                      <li>• Google search ads</li>
                      <li>• Influencer partnerships</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Partnerships (10% of growth)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Mental health platforms</li>
                      <li>• Wellness apps</li>
                      <li>• Healthcare providers</li>
                      <li>• Corporate wellness programs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Key Metrics Targets</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">$5</div>
                  <p className="text-sm text-gray-700">CAC Target</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">$214</div>
                  <p className="text-sm text-gray-700">LTV</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">43x</div>
                  <p className="text-sm text-gray-700">LTV:CAC Ratio</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">12 months</div>
                  <p className="text-sm text-gray-700">Payback Period</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9: Funding Ask
    {
      title: "Funding Ask",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">$2M Series A Round</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Use of Funds</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fundingAllocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.value}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fundingAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Funding Breakdown</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Product Development ($800K)</h4>
                    <p className="text-gray-600 text-sm">AI model improvements, mobile app, new features (voice, video)</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Marketing & Growth ($600K)</h4>
                    <p className="text-gray-600 text-sm">User acquisition, brand building, partnerships</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Team Expansion ($400K)</h4>
                    <p className="text-gray-600 text-sm">Engineering, customer success, operations</p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Operations ($200K)</h4>
                    <p className="text-gray-600 text-sm">Infrastructure, legal, compliance, contingency</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">18 months</div>
                  <p className="text-blue-100">Runway</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">100K+</div>
                  <p className="text-blue-100">Users Target</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">$2.5M</div>
                  <p className="text-blue-100">ARR Target</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">Series B</div>
                  <p className="text-blue-100">Next Round</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 10: Team
    {
      title: "Our Team",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Experienced Leadership Team</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl text-white">👨‍💼</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Alex Chen</h3>
                <p className="text-blue-600 font-medium mb-2">CEO & Co-Founder</p>
                <p className="text-gray-600 text-sm mb-3">Former PM at Google DeepMind, Stanford AI Research</p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">AI/ML</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Product</span>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl text-white">👩‍💻</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Sarah Johnson</h3>
                <p className="text-green-600 font-medium mb-2">CTO & Co-Founder</p>
                <p className="text-gray-600 text-sm mb-3">Ex-Instagram Engineer, MIT CS, 10+ years in AI</p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Engineering</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">ML</span>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl text-white">👨‍🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Michael Park</h3>
                <p className="text-purple-600 font-medium mb-2">Head of Product</p>
                <p className="text-gray-600 text-sm mb-3">Former Product at Tinder, specialized in user psychology</p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Product</span>
                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">UX</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">Why This Team</h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">Deep AI Expertise</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• PhD-level AI research background</li>
                    <li>• Experience at Google, Instagram</li>
                    <li>• Published in top AI conferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-3">Consumer Tech Experience</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Built products at scale (100M+ users)</li>
                    <li>• Expertise in social and dating apps</li>
                    <li>• Strong user psychology understanding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">Proven Track Record</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• 2 successful exits between founders</li>
                    <li>• 50+ years combined experience</li>
                    <li>• Strong network in Silicon Valley</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 11: Timeline
    {
      title: "18-Month Roadmap",
      component: () => (
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-900">Strategic Milestones</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex">
                <div className="w-1/4 pr-8">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Q3 2025</div>
                  <p className="text-gray-600 text-sm">Months 1-3</p>
                </div>
                <div className="w-3/4 bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Foundation & Initial Scale</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-blue-600 mb-2">Product</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Launch mobile app (iOS)</li>
                        <li>• Improve AI memory accuracy</li>
                        <li>• Add 10 new premium scenes</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-blue-600 mb-2">Growth</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Reach 10,000 users</li>
                        <li>• Launch referral program</li>
                        <li>• Partner with 5 influencers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="w-1/4 pr-8">
                  <div className="text-2xl font-bold text-green-600 mb-2">Q4 2025</div>
                  <p className="text-gray-600 text-sm">Months 4-6</p>
                </div>
                <div className="w-3/4 bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Feature Expansion</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-green-600 mb-2">Product</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Launch Android app</li>
                        <li>• Add video calling feature</li>
                        <li>• Implement group companions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-green-600 mb-2">Growth</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Reach 25,000 users</li>
                        <li>• Expand to 3 new markets</li>
                        <li>• Launch affiliate program</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="w-1/4 pr-8">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Q1-Q2 2026</div>
                  <p className="text-gray-600 text-sm">Months 7-12</p>
                </div>
                <div className="w-3/4 bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Scale & Differentiation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-purple-600 mb-2">Product</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Launch enterprise API</li>
                        <li>• Add VR/AR experiences</li>
                        <li>• Implement advanced AI emotions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-purple-600 mb-2">Growth</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Reach 60,000 users</li>
                        <li>• Launch in 10 markets</li>
                        <li>• Secure 5 enterprise partnerships</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="w-1/4 pr-8">
                  <div className="text-2xl font-bold text-orange-600 mb-2">Q3-Q4 2026</div>
                  <p className="text-gray-600 text-sm">Months 13-18</p>
                </div>
                <div className="w-3/4 bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Market Leadership</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-orange-600 mb-2">Product</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Launch Series B features</li>
                        <li>• Add AI companionship marketplace</li>
                        <li>• Implement blockchain identity</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-orange-600 mb-2">Growth</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Reach 100,000+ users</li>
                        <li>• Achieve $2.5M ARR</li>
                        <li>• Launch Series B round</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 12: Contact & Thank You
    {
      title: "Thank You",
      component: () => (
        <div className="h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6">Thank You</h1>
            <p className="text-2xl mb-12 text-blue-100">
              Join us in building the future of meaningful AI companionship
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-semibold mb-8">Get in Touch</h2>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-5xl mb-4">📧</div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-blue-100">investors@tightandhard.ai</p>
                </div>
                <div>
                  <div className="text-5xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-2">Website</h3>
                  <p className="text-blue-100">www.tightandhard.ai</p>
                </div>
                <div>
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-blue-100">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xl text-blue-100">
                <strong className="text-white">AI companions with true memory</strong> is the next evolution in human-AI interaction
              </p>
              <p className="text-lg text-blue-200">
                The market is ready. The technology is here. The time is now.
              </p>
            </div>

            <div className="mt-12 flex justify-center space-x-6">
              <div className="bg-white/20 rounded-full px-6 py-3">
                <span className="text-lg">💙</span> Emotional Intelligence
              </div>
              <div className="bg-white/20 rounded-full px-6 py-3">
                <span className="text-lg">🧠</span> Deep Memory
              </div>
              <div className="bg-white/20 rounded-full px-6 py-3">
                <span className="text-lg">📈</span> Proven Growth
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const CurrentSlide = slides[currentSlide];

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      <div className="h-full w-full">
        <CurrentSlide.component />
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
        
        <div className="ml-4 text-gray-700 font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};

export default SeriesAPitchDeck;