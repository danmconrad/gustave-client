/**
 * This defines a basic set of data for our Gustave Schema.
 *
 * This data is hardcoded for the prototype, but it will
 * eventually be wired to our backend service.
 */

let event1 = {
  id: 1,
  name: 'Dead On TV',
  time: {
    start: '2016-02-18T03:00:00Z',
    end: '2016-02-18T04:30:00Z',
  },
  description: 'Local Chicago favorite Dead on TV has stroked audiences all over the nation with their brand of explosive new-wave punk narcissism.',
  labels: [
    'live music',
    'punk rock',
    'local bands',
  ],
  place: 1,
}

let place1 = {
  id: 1,
  name: 'Cafe Mustache',
  photo: {
    uri: 'http://epicureandculture.com/wp-content/uploads/2015/10/Mustache.jpg',
  },
  description: 'Hip hangout offering coffee, local microbrews & light bites in chill quarters with an eclectic look.',
  labels: [
    'cafe',
    'microbrews',
    'light bites',
    'intimate stage',
  ],
  location: {
    street: '2313 N Milwaukee Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60647'
  },
  geo: {
    lat: 41.923364,
    lng: -87.697749
  },
  hours: '7am-2am',
}

let event2 = {
  id: 2,
  name: 'Cookies and Cocktails',
  time: {
    start: '2016-02-18T05:00:00Z',
    end: '2016-02-18T07:00:00Z',
  },
  description: 'Enjoy a menu of high-end gin cocktails plus chocolate chip cookies served at the stroke of midnight.',
  labels: [
    'sweet tooth',
    'high end cocktails',
    'gin',
  ],
  place: 2,
}

let place2 = {
  id: 2,
  name: 'Scofflaw',
  photo: {
    uri: 'http://media-cdn.tripadvisor.com/media/photo-s/06/46/ee/b4/scofflaw.jpg',
  },
  description: 'Gin-centric cocktails, craft beers & pub grub served in a relaxed urban-rustic bar with cozy nooks.',
  labels: [
    'high end cocktails',
    'fireplace bars',
    'pub grub',
    'gin',
  ],
  location: {
    street: '3201 W Armitage Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60647'
  },
  geo: {
    lat: 41.917163,
    lng: -87.707253
  },
  hours: '5PM–2AM',
}

let event3 = {
  id: 3,
  name: 'Mortal Kombat Showdown',
  time: {
    start: '2016-02-17T23:00:00Z',
    end: '2016-02-18T02:00:00Z',
  },
  description: 'Emporium just got MK1, 2 & 3! Single eliminaton tourney w/ boozey prizes and classic arcade bragging rights. Toasty!!!\n\nRegistration starts @ 5pm.',
  labels: [
    'arcade',
    'tournament',
  ],
  place: 3,
}

let place3 = {
  id: 3,
  name: 'Emporium Logan Square',
  photo: {
    uri: 'https://img.grouponcdn.com/deal/kcicvt5sg5Hg78jY5nVd/Jv-4113x2468/v1/c700x420.jpg',
  },
  description: 'Decades of games, dozens of beers & 60-plus whiskeys in a classic tavern setting with a tin ceiling.',
  labels: [
    'beer fridge',
    'arcade',
    'whiskey',
    'food truck',
  ],
  location: {
    street: '2363 N Milwaukee Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60647'
  },
  geo: {
    lat: 41.9243532,
    lng: -87.6992166
  },
  hours: '5PM–2AM',
}

let event4 = {
  id: 4,
  name: 'New Beers',
  time: {
    start: '2016-02-17T23:00:00Z',
    end: '2016-02-18T08:00:00Z',
  },
  description: 'Come grab a pint of Triple Fist! This seriously hoppy ale that was originally brewed in 2010 to celebrate our one-hundredth brewpub batch is released today at the brewpub.\n\nImperial Pale Ale. 8.6 ABV/IBU 95.',
  labels: [
    'craft beer',
    'limited edition',
  ],
  place: 4,
}

let place4 = {
  id: 4,
  name: 'Revolution Brewing',
  photo: {
    uri: 'http://tpetersen.photographyblogsites.com/files/2012/11/4-berendt-rev-brew-interior-1024x682.jpg',
  },
  description: 'Revolution Brewing is Chicago\'s new hometown craft brewery. Our brewpub in Logan Square is a bustling, neighborhood institution where friends and families meet to enjoy the freshest beer in town.',
  labels: [
    'craft beer',
    'gastropub',
  ],
  location: {
    street: '2323 N Milwaukee Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60647'
  },
  geo: {
    lat: 41.923677,
    lng: -87.698078
  },
  hours: '10am–1AM',
}

let user1 = {
  id: 1,
  name: 'Bob Wehadababyitsaboy',
  lat: 0,
  long: 0,
  recommendations: [1, 2, 3, 4],
  saved: [],
  dismissed: [],
}


// Mocked out data -- it's like a shitty database!
let _data = {
  Place: {
    1: place1,
    2: place2,
    3: place3,
    4: place4,
  },
  Event: {
    1: event1,
    2: event2,
    3: event3,
    4: event4,
  },
  User: {
    1: user1,
  }
};


export function getUser(id) {
  return _data.User[id];
}

function getEvent(id) {
  return _data.Event[id];
}

function getPlace(id) {
  return _data.Place[id];
}

export function dismissUserRecommendation(userId, recommendationId) {
  let user = getUser(userId);

  if (!user.dismissed.includes(recommendationId))
    user.dismissed.push(recommendationId);

  user.saved = user.saved.filter(eventId => eventId !== recommendationId);
}

export function saveUserRecommendation(userId, recommendationId) {
  let user = getUser(userId);

  if (!user.saved.includes(recommendationId))
    user.saved.push(recommendationId);
}

export function removeSavedUserRecommendation(userId, recommendationId) {
  let user = getUser(userId);
  let index = user.saved.indexOf(recommendationId);

  if (index !== -1)
    user.saved.splice(index, 1);
}

export function getUserRecommendations(userId) {
  let user = getUser(userId);

  return user.recommendations
      .filter(event => !user.dismissed.includes(event))
      .map(eventId => getUserRecommendation(userId, eventId));
}

export function getUserSavedRecommendations(userId) {
  let user = getUser(userId);

  return user.saved.map(eventId => getUserRecommendation(userId, eventId));
}

export function isUserSavedRecommendation(userId, recommendationId) {
  let user = getUser(userId);

  return user.saved.includes(recommendationId);
}

export function getUserRecommendation(userID, eventId) {
  let event = getEvent(eventId);
  let place = getPlace(event.place);
  let id = event.id;
  return {event, place, id};
}


