'use client';

import { useEffect } from 'react';
import { englishContentCopy, englishCopy } from '@/content/i18n/english';
import { englishDetailsCopy } from '@/content/i18n/englishDetails';
import { englishLegalCopy } from '@/content/i18n/englishLegal';

const COPY = { ...englishCopy, ...englishContentCopy, ...englishDetailsCopy, ...englishLegalCopy };
const COPY_LOWERCASE = new Map(Object.entries(COPY).map(([source, target]) => [source.toLocaleLowerCase('pt-BR'), target]));

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const months: Readonly<Record<string, string>> = {
  janeiro: 'January', fevereiro: 'February', março: 'March', abril: 'April', maio: 'May',
  junho: 'June', julho: 'July', agosto: 'August', setembro: 'September', outubro: 'October',
  novembro: 'November', dezembro: 'December',
};
const monthsByNumber = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PAYMENT_GROUPS: Readonly<Record<string, string>> = {
  entrada: 'the down payment',
  mensais: 'monthly payments',
  'reforços anuais': 'annual installments',
  chaves: 'the handover payment',
};

const SOLAR_TIME_LABELS: Readonly<Record<string, string>> = {
  'de manhã': 'in the morning',
  'à tarde': 'in the afternoon',
  'o dia quase todo': 'most of the day',
  'cedo e no fim da tarde': 'early in the morning and late in the afternoon',
  'pela frente': 'on the front facade',
  'pelos fundos': 'on the rear facade',
  'pela lateral leste': 'on the east side',
  'pela lateral oeste': 'on the west side',
};

function translate(value: string, context: Element | null = null): string | null {
  const key = normalize(value);
  if (key.toLocaleLowerCase('pt-BR') === 'e os' && context?.closest('[data-i18n-context="commerce-privacy"]')) return 'and the';
  if (key.toLocaleLowerCase('pt-BR') === 'entrada' && context?.closest('[data-i18n-context="payment"]')) return 'Down payment';

  const sampleCart = /^SUA SACOLA \((\d+)\)$/i.exec(key);
  if (sampleCart) return `YOUR BAG (${sampleCart[1]})`;

  const addItemLabel = /^Adicionar (.+)$/i.exec(key);
  if (addItemLabel) return `Add ${translate(addItemLabel[1]!) ?? addItemLabel[1]}`;

  const paymentField = /^(entrada|mensais|reforços anuais|chaves): (percentual|parcelas)$/i.exec(key);
  if (paymentField && context?.closest('[data-i18n-context="payment"]')) {
    const group = PAYMENT_GROUPS[paymentField[1]!.toLocaleLowerCase('pt-BR')] ?? paymentField[1]!;
    const field = paymentField[2]!.toLocaleLowerCase('pt-BR') === 'percentual' ? 'percentage' : 'installments';
    return `${group}: ${field}`;
  }

  const direct = COPY[key] ?? COPY_LOWERCASE.get(key.toLocaleLowerCase('pt-BR'));
  if (direct) return direct;

  const solarHour = /^(\d{1,2})h(\d{2})?$/i.exec(key);
  if (solarHour) return `${solarHour[1]!.padStart(2, '0')}:${solarHour[2] ?? '00'}`;

  const relativeRate = /^mais (.+)$/i.exec(key);
  if (relativeRate) return `plus ${relativeRate[1]}`;

  if (key.includes(' · ')) {
    const parts = key.split(' · ').map((part) => translate(part));
    if (parts.every((part): part is string => Boolean(part))) return parts.join(' · ');
  }

  const date = /^(\d{1,2}) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de (\d{4})$/i.exec(key);
  if (date) return `${months[date[2]!.toLowerCase()]} ${date[1]}, ${date[3]}`;

  const health = /^(\d+) pontos de vida$/i.exec(key);
  if (health) return `${health[1]} health points`;

  const photo = /^Ver foto (\d+) de (\d+)$/i.exec(key);
  if (photo) return `View photo ${photo[1]} of ${photo[2]}`;

  const screen = /^Ver tela (\d+):\s*(.+)$/i.exec(key);
  if (screen) return `View screen ${screen[1]}: ${translate(screen[2]!) ?? screen[2]}`;

  const paymentAdjustment = /^A primeira parcela de (.+) leva (.+) a mais, para a soma fechar no centavo\.$/i.exec(key);
  if (paymentAdjustment) {
    const group = PAYMENT_GROUPS[paymentAdjustment[1]!.toLocaleLowerCase('pt-BR')] ?? paymentAdjustment[1]!;
    return `The first installment for ${group} is ${paymentAdjustment[2]} higher so the total adds up exactly.`;
  }

  const paymentSummary = /^Condição de pagamento: (.+)$/i.exec(key);
  if (paymentSummary) {
    const parts = paymentSummary[1]!.split(', ').map((part) => {
      const item = /^(.+?) ([\d,.]+%)$/.exec(part);
      if (!item) return null;
      const group = PAYMENT_GROUPS[item[1]!.toLocaleLowerCase('pt-BR')];
      return group ? `${group} ${item[2]}` : null;
    });
    if (parts.every((part): part is string => Boolean(part))) return `Payment terms: ${parts.join(', ')}`;
  }

  const unitStatus = /^Unidade (\d+) marcada como (disponível|reservada|vendida|indisponível)$/i.exec(key);
  if (unitStatus) {
    const status = translate(unitStatus[2]!) ?? unitStatus[2]!;
    return `Unit ${unitStatus[1]} marked as ${status.toLowerCase()}`;
  }

  const unitsStatus = /^(\d+) unidades(?: do (.+?))? marcadas como (disponíveis|reservadas|vendidas|indisponíveis)$/i.exec(key);
  if (unitsStatus) {
    const status = translate(unitsStatus[3]!) ?? unitsStatus[3]!;
    const floorRange = unitsStatus[2] ? /^(\d+)(?:º|°)(?:–(\d+)(?:º|°)?)?$/.exec(unitsStatus[2]) : null;
    const where = floorRange ? ` on ${floorRange[2] ? `floors ${floorRange[1]}–${floorRange[2]}` : `floor ${floorRange[1]}`}` : '';
    return `${unitsStatus[1]} units${where} marked as ${status.toLowerCase()}`;
  }

  const unitPrice = /^Preço da (\d+) alterado para (.+)$/i.exec(key);
  if (unitPrice) return `Price for unit ${unitPrice[1]} changed to ${unitPrice[2]}`;

  const priceListChange = /^Tabela (\d+): reajuste de ([+−-]?[\d,.]+%) em (\d+) (disponíveis|não vendidas|unidades)$/i.exec(key);
  if (priceListChange) {
    const amount = priceListChange[2]!.replace('−', '-');
    const scope = priceListChange[4]!.toLocaleLowerCase('pt-BR') === 'disponíveis'
      ? 'available units'
      : priceListChange[4]!.toLocaleLowerCase('pt-BR') === 'não vendidas' ? 'unsold units' : 'units';
    return `Price list ${priceListChange[1]}: ${amount} adjustment for ${priceListChange[3]} ${scope}`;
  }

  const constructionChange = /^Obra: (.+)$/i.exec(key);
  if (constructionChange) {
    const parts = constructionChange[1]!.split(', ').map((part) => {
      const structure = /^estrutura até o (\d+)º$/i.exec(part);
      if (structure) return `structure through floor ${structure[1]}`;
      const facade = /^fachada até o (\d+)º$/i.exec(part);
      if (facade) return `facade through floor ${facade[1]}`;
      const month = /^mês (\d+) de (\d+)$/i.exec(part);
      if (month) return `month ${month[1]} of ${month[2]}`;
      if (part === 'fachada por começar') return 'facade work not started';
      if (part === 'etapas atualizadas') return 'stages updated';
      return null;
    });
    if (parts.every((part): part is string => Boolean(part))) return `Construction: ${parts.join(', ')}`;
  }

  const hotelRate = /^Diária da (categoria|suíte) alterada para (.+)$/i.exec(key);
  if (hotelRate) return `Nightly rate for the ${hotelRate[1]!.toLocaleLowerCase('pt-BR') === 'suíte' ? 'suite' : 'category'} changed to ${hotelRate[2]}`;

  const weekendRate = /^Fim de semana: diárias ([+−-].+)$/i.exec(key);
  if (weekendRate) return `Weekend rates: ${weekendRate[1]!.replace('−', '-')}`;

  const shortDate = (date: string) => {
    const parts = /^(\d{1,2})\/(\d{1,2})$/.exec(date);
    return parts ? `${monthsByNumber[Number(parts[2])] ?? parts[2]} ${Number(parts[1])}` : date;
  };

  if (key.toLocaleLowerCase('pt-BR') === 'a' && context?.closest('[data-i18n-context="hotel-date-range"]')) return 'to';

  const todayDate = /^hoje, (\d{1,2}\/\d{1,2})$/i.exec(key);
  if (todayDate) return `today, ${shortDate(todayDate[1]!)}`;

  const weekdayDate = /^(dom|seg|ter|qua|qui|sex|sáb) (\d{1,2}\/\d{1,2})$/i.exec(key);
  if (weekdayDate) {
    const weekdays: Readonly<Record<string, string>> = { dom: 'Sun', seg: 'Mon', ter: 'Tue', qua: 'Wed', qui: 'Thu', sex: 'Fri', 'sáb': 'Sat' };
    return `${weekdays[weekdayDate[1]!.toLocaleLowerCase('pt-BR')]} ${shortDate(weekdayDate[2]!)}`;
  }

  const bookingHeader = /^HOSPEDADOS NA NOITE DE (\d{1,2}\/\d{1,2}) E FEITAS NA DEMONSTRAÇÃO$/i.exec(key);
  if (bookingHeader) return `GUESTS STAYING ON ${shortDate(bookingHeader[1]!)} AND DEMO BOOKINGS`;

  const dayHeading = /^CHEGADAS EM (\d{1,2}\/\d{1,2})$/i.exec(key);
  if (dayHeading) return `ARRIVALS ON ${shortDate(dayHeading[1]!)}`;

  const shownCount = /^Mostrando 40 de (\d+)\. Filtre pelo número do quarto\.$/i.exec(key);
  if (shownCount) return `Showing 40 of ${shownCount[1]}. Filter by room number.`;

  const reservation = /^Quarto (\d+) reservado de (\d{1,2}\/\d{1,2}) a (\d{1,2}\/\d{1,2}) \((pelo cliente|pelo painel)\)$/i.exec(key);
  if (reservation) {
    const origin = reservation[4]!.toLocaleLowerCase('pt-BR') === 'pelo cliente' ? 'by the guest' : 'from the dashboard';
    return `Room ${reservation[1]} reserved from ${shortDate(reservation[2]!)} to ${shortDate(reservation[3]!)} (${origin})`;
  }

  const canceledReservation = /^Reserva do quarto (\d+) \((\d{1,2}\/\d{1,2}) a (\d{1,2}\/\d{1,2})\) cancelada$/i.exec(key);
  if (canceledReservation) return `Reservation for room ${canceledReservation[1]} (${shortDate(canceledReservation[2]!)} to ${shortDate(canceledReservation[3]!)}) canceled`;

  const roomMaintenance = /^Quarto (\d+) bloqueado para manutenção de (\d{1,2}\/\d{1,2}) a (\d{1,2}\/\d{1,2})$/i.exec(key);
  if (roomMaintenance) return `Room ${roomMaintenance[1]} blocked for maintenance from ${shortDate(roomMaintenance[2]!)} to ${shortDate(roomMaintenance[3]!)}`;

  const roomFreed = /^Quarto (\d+) liberado$/i.exec(key);
  if (roomFreed) return `Room ${roomFreed[1]} unblocked`;

  const invalidPriceSum = /^A soma precisa dar 100%; está em (.+)\.$/i.exec(key);
  if (invalidPriceSum) return `The total must equal 100%; it is currently ${invalidPriceSum[1]}.`;

  const installmentRange = /^Parcelas fora do intervalo \((\d+) a (\d+)\)\.$/i.exec(key);
  if (installmentRange) return `Installments must be between ${installmentRange[1]} and ${installmentRange[2]}.`;

  const stayLength = /^Na demonstração, a estadia vai até (\d+) noites\.$/i.exec(key);
  if (stayLength) return `In this demo, stays can be up to ${stayLength[1]} nights.`;

  const roomCount = /^(\d+) quartos? livres? para (\d+) pessoas?(?: em (.+))?\.$/i.exec(key);
  if (roomCount) {
    const category = roomCount[3] ? ` in ${translate(roomCount[3]!) ?? roomCount[3]}` : '';
    return `${roomCount[1]} ${roomCount[1] === '1' ? 'room' : 'rooms'} available for ${roomCount[2]} ${roomCount[2] === '1' ? 'guest' : 'guests'}${category}.`;
  }

  const unitPriceDetail = /^(Disponível|Reservada|Vendida|Indisponível) · (.+)$/i.exec(key);
  if (unitPriceDetail) return `${translate(unitPriceDetail[1]!) ?? unitPriceDetail[1]} · ${unitPriceDetail[2]}`;

  const nightlyRateDetail = /^(.+) · (.+) a diária$/i.exec(key);
  if (nightlyRateDetail) return `${translate(nightlyRateDetail[1]!) ?? nightlyRateDetail[1]} · ${nightlyRateDetail[2]} per night`;

  const floorView = /^Vista do (?:quarto )?(\d+)$/i.exec(key);
  if (floorView) return `View from ${key.toLowerCase().includes('quarto') ? 'room ' : 'unit '}${floorView[1]}`;

  const floorDirection = /^(Subir|Descer): (.+)$/i.exec(key);
  if (floorDirection) {
    const direction = floorDirection[1]!.toLocaleLowerCase('pt-BR') === 'subir' ? 'Go up to' : 'Go down to';
    const destination = /^(\d+) · (.+)$/.exec(floorDirection[2]!);
    if (destination) return `${direction} unit ${destination[1]} · ${destination[2]}`;
    const roomDestination = /^Quarto (\d+)$/i.exec(floorDirection[2]!);
    if (roomDestination) return `${direction} room ${roomDestination[1]}`;
    return `${direction} ${floorDirection[2]}`;
  }

  const priceListLabel = /^Tabela (\d+) · lançamento$/i.exec(key);
  if (priceListLabel) return `Price list ${priceListLabel[1]} · launch`;
  const adjustedPriceListLabel = /^Tabela (\d+) · ([+−-][\d,.]+%)$/i.exec(key);
  if (adjustedPriceListLabel) return `Price list ${adjustedPriceListLabel[1]} · ${adjustedPriceListLabel[2]!.replace('−', '-')}`;

  const apartmentLine = /^Unidade (\d+) · final (\d+) · (.+)$/i.exec(key);
  if (apartmentLine) return `Unit ${apartmentLine[1]} · stack ${apartmentLine[2]} · ${translate(apartmentLine[3]!) ?? apartmentLine[3]}`;

  const apartmentDescription = /^(Planta do final 03, espelhada da planta-base\. )?Dois dormitórios com suíte, ([\d,.]+ m²) privativos e ([\d,.]+ m²) úteis: (.+)\.$/i.exec(key);
  if (apartmentDescription) {
    const details = apartmentDescription[4]!.split('; ').map((part) => translate(part));
    if (details.every((part): part is string => Boolean(part))) {
      const privateArea = apartmentDescription[2]!.replace(',', '.');
      const usableArea = apartmentDescription[3]!.replace(',', '.');
      const mirrored = apartmentDescription[1] ? 'Mirrored version of the base floor plan. ' : '';
      return `${mirrored}Two bedrooms with an en-suite, ${privateArea} of private area and ${usableArea} of usable area: ${details.join('; ')}.`;
    }
  }

  const apartmentSunlight = /^Sol das (\d{1,2}h\d{2}) \(hora solar\), no (verão|equinócio|inverno), entrando pelas janelas\. Simulação aproximada\.$/i.exec(key);
  if (apartmentSunlight) {
    const time = apartmentSunlight[1]!.replace(/^(\d{1,2})h(\d{2})$/i, (_match, hour: string, minute: string) => `${hour.padStart(2, '0')}:${minute}`);
    const season = translate(apartmentSunlight[2]!) ?? apartmentSunlight[2]!;
    return `Sunlight at ${time} (solar time), in ${season.toLowerCase()}, coming through the windows. Approximate simulation.`;
  }
  const sunset = /^(\d{1,2}h\d{2}): o sol já se pôs e as luzes da casa estão acesas\.$/i.exec(key);
  if (sunset) {
    const time = sunset[1]!.replace(/^(\d{1,2})h(\d{2})$/i, (_match, hour: string, minute: string) => `${hour.padStart(2, '0')}:${minute}`);
    return `${time}: the sun has set and the lights are on.`;
  }

  const roomArea = /^(.+): ([\d,.]+ m²)\.$/i.exec(key);
  if (roomArea) {
    const room = translate(roomArea[1]!);
    if (room) return `${room}: ${roomArea[2]!.replace(',', '.')}.`;
  }

  const recordingProgress = /^Parar gravação · (\d+)%$/i.exec(key);
  if (recordingProgress) return `Stop recording · ${recordingProgress[1]}%`;
  const videoReady = /^Vídeo pronto, em ([A-Z0-9]+)\.$/i.exec(key);
  if (videoReady) return `Video ready in ${videoReady[1]}`;

  const corner = /^canto (nordeste|noroeste|sudeste|sudoeste)$/i.exec(key);
  if (corner) {
    const directions: Readonly<Record<string, string>> = { nordeste: 'northeast', noroeste: 'northwest', sudeste: 'southeast', sudoeste: 'southwest' };
    return `${directions[corner[1]!.toLocaleLowerCase('pt-BR')]} corner`;
  }

  const solarSummary = /^Sol direto no (.+?) \(hora solar\): (.+)\.$/i.exec(key);
  if (solarSummary) {
    const facades = solarSummary[2]!.split('; ').map((part) => {
      const separator = part.indexOf(': ');
      if (separator < 0) return null;
      const facade = translate(part.slice(0, separator)) ?? part.slice(0, separator);
      const detail = part.slice(separator + 2);
      if (detail.toLocaleLowerCase('pt-BR') === 'sem sol direto') return `${facade}: no direct sunlight`;
      const intervals = [...detail.matchAll(/das (\d{1,2}h(?:\d{2})?) às (\d{1,2}h(?:\d{2})?)/gi)];
      if (!intervals.length) return null;
      const englishTime = (time: string) => time.replace(/^(\d{1,2})h(\d{2})?$/i, (_match, hour: string, minute?: string) => `${hour.padStart(2, '0')}:${minute ?? '00'}`);
      return `${facade}: ${intervals.map((interval) => `${englishTime(interval[1]!)}–${englishTime(interval[2]!)}`).join(' and ')}`;
    });
    if (facades.every((part): part is string => Boolean(part))) {
      return `Direct sunlight in ${(translate(solarSummary[1]!) ?? solarSummary[1]!).toLocaleLowerCase('en-US')} (solar time): ${facades.join('; ')}.`;
    }
  }

  const sunSummary = key.split('; ').map((part) => {
    const match = /^(de manhã|à tarde|o dia quase todo|cedo e no fim da tarde) (pela frente|pelos fundos|pela lateral leste|pela lateral oeste)$/i.exec(part);
    if (!match) return null;
    const period = SOLAR_TIME_LABELS[match[1]!.toLocaleLowerCase('pt-BR')];
    const facade = SOLAR_TIME_LABELS[match[2]!.toLocaleLowerCase('pt-BR')];
    return period && facade ? `${period} ${facade}` : null;
  });
  if (sunSummary.every((part): part is string => Boolean(part))) return sunSummary.join('; ');

  const orderNumber = /^PEDIDO (\d+)$/i.exec(key);
  if (orderNumber) return `ORDER ${orderNumber[1]}`;

  const people = /^(\d+) pessoas?$/i.exec(key);
  if (people) return `${people[1]} ${people[1] === '1' ? 'guest' : 'guests'}`;

  const floor = /^Andar (.+) inteiro$/i.exec(key);
  if (floor) return `Entire floor ${translate(floor[1]!) ?? floor[1]}`;

  const room = /^Quarto (\d+), (.+), (\d+)º andar, até (\d+) pessoas, (.+)$/i.exec(key);
  if (room) return `Room ${room[1]}, ${translate(room[2]!) ?? room[2]}, floor ${room[3]}, up to ${room[4]} guests, ${translate(room[5]!) ?? room[5]}`;

  const apartment = /^Apartamento ([^,]+), final ([^,]+), (.+) pavimento, (.+), (.+)$/i.exec(key);
  if (apartment) return `Apartment ${apartment[1]}, stack ${apartment[2]}, ${translate(apartment[3]!) ?? apartment[3]} floor, ${translate(apartment[4]!) ?? apartment[4]}, ${apartment[5]}`;

  const hotelOccupancy = /^Ocupação na noite de (.+) \(fictícia\)$/i.exec(key);
  if (hotelOccupancy) return `Occupancy on the night of ${translate(hotelOccupancy[1]!) ?? hotelOccupancy[1]} (fictional)`;

  const inventory = /^(.+) (.+): carros na loja$/i.exec(key);
  if (inventory) return `${inventory[1]} ${translate(inventory[2]!) ?? inventory[2]}: cars in stock`;

  const noInventory = /^(.+): situação sem carro na loja$/i.exec(key);
  if (noInventory) return `${noInventory[1]}: no cars in stock`;

  const arrival = /^(.+): chega em quantos dias$/i.exec(key);
  if (arrival) return `Days until ${arrival[1]} arrives`;

  const highlights = /^Destaques (.+)$/i.exec(key);
  if (highlights) return `Highlights ${translate(highlights[1]!) ?? highlights[1]}`;

  const closeLabel = /^Fechar: (.+)$/i.exec(key);
  if (closeLabel) return `Close: ${translate(closeLabel[1]!) ?? closeLabel[1]}`;

  const photos = /^Fotos: (.+)$/i.exec(key);
  if (photos) return `Photos: ${translate(photos[1]!) ?? photos[1]}`;

  const removeLabel = /^Remover (.+)$/i.exec(key);
  if (removeLabel) return `Remove ${translate(removeLabel[1]!) ?? removeLabel[1]}`;

  const productName = /^(Boneco 3D de|Camiseta|Caneca|Copo) (.+)$/i.exec(key);
  if (productName) {
    const prefix = productName[1]!.toLowerCase();
    const name = productName[2]!;
    if (prefix === 'boneco 3d de') return `${name} 3D figure`;
    if (prefix === 'camiseta') return `${name} T-shirt`;
    if (prefix === 'copo') return `${name} tumbler`;
    return `${name} mug`;
  }

  const figureDescription = /^Um boneco de (.+) impresso em 3D, para a estante ou a mesa de trabalho\.$/i.exec(key);
  if (figureDescription) return `A 3D-printed ${figureDescription[1]} figure for your shelf or desk.`;

  const shirtDescription = /^Camiseta com a arte de (.+)\.$/i.exec(key);
  if (shirtDescription) return `A T-shirt featuring ${shirtDescription[1]} artwork.`;

  const mugDescription = /^Caneca com a arte de (.+), para o café de todo dia\.$/i.exec(key);
  if (mugDescription) return `A mug featuring ${mugDescription[1]} artwork for your everyday coffee.`;

  const figureAlt = /^Boneco 3D de (.+): (.+), sobre a base com o nome do jogo\.$/i.exec(key);
  if (figureAlt) return `${figureAlt[1]} 3D figure: ${translate(figureAlt[2]!) ?? figureAlt[2]}, on a base bearing the game’s name.`;

  const shirtAlt = /^Camiseta preta com a arte de (.+) no peito: (.+)\.$/i.exec(key);
  if (shirtAlt) return `Black T-shirt with ${shirtAlt[1]} artwork on the chest: ${translate(shirtAlt[2]!) ?? shirtAlt[2]}.`;

  const mugAlt = /^Caneca branca de cerâmica com a arte de (.+): (.+)\.$/i.exec(key);
  if (mugAlt) return `White ceramic mug featuring ${mugAlt[1]} artwork: ${translate(mugAlt[2]!) ?? mugAlt[2]}.`;

  const productSummary = /^(.+) em miniatura, impresso em 3D\.$/i.exec(key);
  if (productSummary) return `${productSummary[1]} as a 3D-printed miniature.`;

  const productArt = /^A arte de (.+) numa camiseta\.$/i.exec(key);
  if (productArt) return `A T-shirt featuring ${productArt[1]} artwork.`;

  const mugArt = /^A arte de (.+) na caneca do café\.$/i.exec(key);
  if (mugArt) return `A coffee mug featuring ${mugArt[1]} artwork.`;

  const shirtSizes = /^Tamanhos de (.+) a (.+)\.$/i.exec(key);
  if (shirtSizes) return `Sizes ${shirtSizes[1]} to ${shirtSizes[2]}.`;

  return null;
}

function translateText(node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.closest('script, style, noscript, textarea, pre, code, [data-no-translate]')) return;
  const original = node.nodeValue ?? '';
  const replacement = translate(original, parent);
  if (!replacement) return;
  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  node.nodeValue = `${leading}${replacement}${trailing}`;
}

const TEXT_ATTRIBUTES = ['alt', 'aria-label', 'aria-description', 'aria-valuetext', 'placeholder', 'title', 'content'] as const;

function translateElement(element: Element) {
  if (element.closest('script, style, noscript, textarea, pre, code, [data-no-translate]')) return;
  for (const attribute of TEXT_ATTRIBUTES) {
    const original = element.getAttribute(attribute);
    if (!original) continue;
    const replacement = translate(original, element);
    if (replacement) element.setAttribute(attribute, replacement);
  }
}

function translateTree(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) translateText(walker.currentNode as Text);
  if (root instanceof Element) translateElement(root);
  root.querySelectorAll('*').forEach(translateElement);
}

/** Applies the reviewed English phrase catalog to the current page and later UI updates. */
export function EnglishTranslation() {
  useEffect(() => {
    const enabled = document.cookie.split(';').some((cookie) => cookie.trim() === 'blajeen-locale=en');
    if (!enabled) return;
    document.documentElement.lang = 'en';
    document.documentElement.dataset.locale = 'en';
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', 'en_US');
    const translatePage = () => {
      translateTree(document.head);
      translateTree(document.body);
      const title = translate(document.title);
      if (title) document.title = title;
    };
    translatePage();

    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.type === 'characterData' && change.target instanceof Text) {
          translateText(change.target);
        } else if (change.type === 'attributes' && change.target instanceof Element) {
          translateElement(change.target);
        } else {
          change.addedNodes.forEach((node) => {
            if (node instanceof Text) translateText(node);
            else if (node instanceof Element) translateTree(node);
          });
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TEXT_ATTRIBUTES],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
