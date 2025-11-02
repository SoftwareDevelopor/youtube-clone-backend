const user=require('../Models/User_Auth')


// Check if user has a free download left for today
exports.hasFreeDownloadToday = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      console.log('hasFreeDownloadToday: email is missing');
      return res.status(400).json({ 
        message: 'email is required.', 
        free: false, 
        isPremium: false 
      });
    }
    
    console.log('hasFreeDownloadToday: checking for email:', email);
    
    const user = await user.findOne({ email });
    if (!user) {
      console.log('hasFreeDownloadToday: user not found, creating new user');
      
      await user.save();
      
      return res.json({ 
        free: true, 
        isPremium: false,
        message: 'New user created with free download'
      });
    }
    
    console.log('hasFreeDownloadToday: found user, checking premium status');
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      console.log('hasFreeDownloadToday: premium expired, updating user');
      user.isPremium = false;
      user.premiumExpiry = null;
      await user.save();
    }
    
    // Premium users get unlimited downloads
    if (user.isPremium) {
      console.log('hasFreeDownloadToday: user is premium, allowing download');
      return res.json({ 
        free: true, 
        isPremium: true,
        message: 'Premium user - unlimited downloads'
      });
    }
    
    console.log('hasFreeDownloadToday: user is not premium, checking daily downloads');
    
    // Free users get 1 download per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ensure downloads array exists
    if (!user.downloads) {
      user.downloads = [];
    }
    
    const downloadsToday = user.downloads.filter(d => {
      if (!d.date) return false;
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    });
    
    const hasFreeDownload = downloadsToday.length < 1;
    console.log('hasFreeDownloadToday: downloads today:', downloadsToday.length, 'hasFreeDownload:', hasFreeDownload);
    
    res.json({ 
      free: hasFreeDownload, 
      isPremium: false,
      downloadsToday: downloadsToday.length,
      message: hasFreeDownload ? 'Free download available' : 'No free downloads left today'
    });
    
  } catch (err) {
    console.error('hasFreeDownloadToday error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message, 
      free: false, 
      isPremium: false 
    });
  }
};

// Activate premium plan for a user
exports.activatePremium = async (req, res) => {
  try {
    const { email, duration = 30 } = req.body; // duration in days, default 30 days
    if (!email) return res.status(400).json({ message: 'email is required.' });
    
    const user = await user.findOne({ email });
    if (!user) return res.status(404).json({ message: 'user not found.' });
    
    // Set premium status and expiry date
    user.isPremium = true;
    user.premiumExpiry = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // Add days to current date
    await user.save();
    
    res.json({ 
      message: 'Premium plan activated successfully', 
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check premium status
exports.checkPremiumStatus = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required.' });
    
    const user = await user.findOne({ email });
    if (!user) return res.status(404).json({ message: 'user not found.' });
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      user.isPremium = false;
      user.premiumExpiry = null;
      await user.save();
    }
    
    res.json({ 
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 