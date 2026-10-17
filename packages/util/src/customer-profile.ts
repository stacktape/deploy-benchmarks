// Shared customer normalization and currency statistics used in the audit envelope.
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import countries from 'i18n-iso-countries';
import { mean, std, round } from 'mathjs';

export function customerProfile(country: string, phone: string, amounts: number[]) {
  const parsed = parsePhoneNumberFromString(phone, 'US');
  if (!parsed?.isValid()) throw new Error('Invalid customer phone');
  return {
    country: countries.alpha2ToAlpha3(country),
    phone: parsed.number,
    average: round(Number(mean(amounts)), 2),
    deviation: round(Number(std(amounts)), 2)
  };
}
