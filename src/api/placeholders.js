import {
  mockCreator,
  mockEvents,
  mockMemberships,
  mockSponsors,
  mockTestimonials,
} from "../data/mockData";

function simulateApi(data) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), 120);
  });
}

export function getEvents() {
  return simulateApi(mockEvents);
}

export function getMemberships() {
  return simulateApi(mockMemberships);
}

export function getTestimonials() {
  return simulateApi(mockTestimonials);
}

export function getSponsors() {
  return simulateApi(mockSponsors);
}

export function getCreatorProfile() {
  return simulateApi(mockCreator);
}
