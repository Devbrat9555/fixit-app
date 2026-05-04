export const getCategoryThumbnail = (categoryName) => {
  const defaults = {
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    'Plumbing': 'https://images.unsplash.com/photo-1585913656125-1403f7e5b0ec?w=800&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545724813-58ff312ce0b4?w=800&q=80',
    'Painting': 'https://images.unsplash.com/photo-1562259949-e8e76833c080?w=800&q=80',
    'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
    'Pest Control': 'https://images.unsplash.com/photo-1587316008410-1415539d0f5e?w=800&q=80',
    'Salon at Home': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'Appliance Repair': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
    'Massage Therapy': 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?w=800&q=80',
    'Home Automation': 'https://images.unsplash.com/photo-1558002038-1037906d9927?w=800&q=80',
    'Home Maintenance': 'https://images.unsplash.com/photo-1581578736496-51f7d5403061?w=800&q=80'
  };

  // If no direct match, try to find a key that is contained in the categoryName
  const matchedKey = Object.keys(defaults).find(key => 
    categoryName?.toLowerCase().includes(key.toLowerCase())
  );

  return defaults[matchedKey] || defaults[categoryName] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';
};
