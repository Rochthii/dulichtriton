import { commonVi } from './vi/common';
import { homeVi } from './vi/home';
import { placesVi } from './vi/places';
import { foodVi } from './vi/food';
import { stayVi } from './vi/stay';
import { cultureVi } from './vi/culture';
import { itineraryVi } from './vi/itinerary';
import { mapVi } from './vi/map';
import { guideVi } from './vi/guide';
import { emergencyVi } from './vi/emergency';
import { partnerVi } from './vi/partner';
import { chatbotVi } from './vi/chatbot';

export const vi = {
  common: commonVi,
  nav: commonVi.nav,
  home: homeVi,
  places: placesVi,
  food: foodVi,
  stay: stayVi,
  culture: cultureVi,
  itinerary: itineraryVi,
  map: mapVi,
  guide: guideVi,
  emergency: emergencyVi,
  partner: partnerVi,
  chatbot: chatbotVi,
};

export type Dictionary = typeof vi;
