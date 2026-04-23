export const getCategoryThumbnail = (categoryName) => {
  const defaults = {
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    'Plumbing': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1558223401-f17978f14187?w=800&q=80',
    'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
    'Pest Control': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    'Salon at Home': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'Appliance Repair': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80'
  };

  return defaults[categoryName] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';
};
