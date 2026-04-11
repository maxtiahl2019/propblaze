'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  black:'#080808', black2:'#111111', black3:'#181818',
  white:'#FFFFFF', w80:'rgba(255,255,255,0.80)', w60:'rgba(255,255,255,0.60)',
  w40:'rgba(255,255,255,0.40)', w20:'rgba(255,255,255,0.20)', w10:'rgba(255,255,255,0.08)',
  border:'rgba(255,255,255,0.10)', border2:'rgba(255,255,255,0.18)',
  gold:'#F5C200', green:'#22C55E', greenDk:'#16A34A', blue:'#3B82F6',
  purple:'#A855F7', red:'#F87171',
};

// ─── Geographic regions for smart matching ────────────────────────────────────
const BALKANS = ['Serbia','Montenegro','Croatia','Bosnia','Slovenia','North Macedonia','Albania','Kosovo'];
const ADRIATIC = ['Montenegro','Croatia','Slovenia','Albania','Italy'];
const MEDITERRANEAN = ['Montenegro','Croatia','Greece','Spain','Portugal','France','Italy','Albania'];
const DACH = ['Germany','Austria','Switzerland'];
const CEE = ['Czech Republic','Hungary','Poland','Romania','Slovakia','Bulgaria','Slovenia'];

// ─── Agency database ──────────────────────────────────────────────────────────
const ALL_AGENCIES = [
  // ── Montenegro (local market — always top for MNE properties) ──
  { id:'me-01', flag:'🇲🇪', name:'Adriatic Real Estate',         city:'Podgorica',     country:'Montenegro',  spec:'Residential · Adriatic · Investors',         langs:['EN','SR','RU'], types:['apartment','villa','house','land'],  priceMin:50,   priceMax:2000,  focus:['Montenegro','Serbia','Croatia'] },
  { id:'me-02', flag:'🇲🇪', name:'Montenegro Realty d.o.o.',     city:'Budva',         country:'Montenegro',  spec:'Coastal · Tourism · Investment · Budva',      langs:['EN','SR','RU'], types:['villa','apartment','land','penthouse'], priceMin:80, priceMax:5000,  focus:['Montenegro'] },
  { id:'me-03', flag:'🇲🇪', name:'Kotor Bay Properties',         city:'Kotor',         country:'Montenegro',  spec:'Luxury coastal · Historical · HNW',           langs:['EN','SR'],      types:['house','villa','penthouse'],          priceMin:150,  priceMax:4000,  focus:['Montenegro'] },
  { id:'me-04', flag:'🇲🇪', name:'Riviera Immo d.o.o.',          city:'Budva',         country:'Montenegro',  spec:'Budva Riviera · All property types',          langs:['EN','SR','RU','DE'], types:['apartment','villa','commercial','land'], priceMin:40, priceMax:3000, focus:['Montenegro'] },
  { id:'me-05', flag:'🇲🇪', name:'Montenegrina Estates',         city:'Herceg Novi',   country:'Montenegro',  spec:'Herceg Novi · Luxury · Expat buyers',         langs:['EN','SR','RU'], types:['villa','house','apartment'],          priceMin:100,  priceMax:3500,  focus:['Montenegro'] },
  { id:'me-06', flag:'🇲🇪', name:'Tivat Bay Luxury',             city:'Tivat',         country:'Montenegro',  spec:'Porto Montenegro · Marina · Superyacht crowd', langs:['EN','SR'],      types:['villa','penthouse','apartment'],      priceMin:300,  priceMax:8000,  focus:['Montenegro'] },
  { id:'me-07', flag:'🇲🇪', name:'Montenegro Golf & Sea Realty', city:'Luštica Bay',   country:'Montenegro',  spec:'Resort · Golf · Adriatic coast',              langs:['EN','SR','RU'], types:['villa','apartment','penthouse'],      priceMin:200,  priceMax:5000,  focus:['Montenegro'] },
  { id:'me-08', flag:'🇲🇪', name:'Bar Coast Properties',         city:'Bar',           country:'Montenegro',  spec:'Bar · Budget investment · Residential',       langs:['EN','SR','RU'], types:['apartment','house','land'],           priceMin:30,   priceMax:600,   focus:['Montenegro'] },
  { id:'me-09', flag:'🇲🇪', name:'Ulcinj Prime Real Estate',     city:'Ulcinj',        country:'Montenegro',  spec:'Ulcinj · Long beach · Albanian diaspora',     langs:['EN','SR','SQ'], types:['apartment','land','house'],           priceMin:25,   priceMax:500,   focus:['Montenegro'] },
  { id:'me-10', flag:'🇲🇪', name:'NovoPodgorica Realty',         city:'Podgorica',     country:'Montenegro',  spec:'Capital city · New construction · Investors', langs:['EN','SR'],      types:['apartment','commercial','penthouse'], priceMin:60,   priceMax:1200,  focus:['Montenegro'] },

  // ── Serbia ──
  { id:'rs-01', flag:'🇷🇸', name:'Beograd Properties d.o.o.',   city:'Belgrade',      country:'Serbia',      spec:'City centre · Residential · Investors',       langs:['EN','SR'],      types:['apartment','penthouse','commercial'], priceMin:50,   priceMax:1000,  focus:['Serbia','Montenegro'] },
  { id:'rs-02', flag:'🇷🇸', name:'Novi Sad Nekretnine',         city:'Novi Sad',      country:'Serbia',      spec:'Novi Sad · Residential · Land',               langs:['EN','SR'],      types:['apartment','house','land'],           priceMin:30,   priceMax:500,   focus:['Serbia'] },
  { id:'rs-03', flag:'🇷🇸', name:'Serbia Land Invest',          city:'Belgrade',      country:'Serbia',      spec:'Land · Development · Agriculture · SEE',      langs:['EN','SR','DE'], types:['land'],                               priceMin:10,   priceMax:2000,  focus:['Serbia','Montenegro','Bosnia'] },
  { id:'rs-04', flag:'🇷🇸', name:'Adriatic Bridge RS',          city:'Belgrade',      country:'Serbia',      spec:'Serbian buyers for Adriatic · Montenegro specialist', langs:['EN','SR'], types:['villa','apartment','house'],       priceMin:60,   priceMax:3000,  focus:['Montenegro','Croatia','Serbia'] },
  { id:'rs-05', flag:'🇷🇸', name:'Luxury Belgrade Properties',  city:'Belgrade',      country:'Serbia',      spec:'Luxury · High-end · CEE investors',           langs:['EN','SR','RU'], types:['penthouse','villa','apartment'],      priceMin:150,  priceMax:5000,  focus:['Serbia','Montenegro'] },
  { id:'rs-06', flag:'🇷🇸', name:'Capital City RE d.o.o.',      city:'Belgrade',      country:'Serbia',      spec:'Commercial · Mixed-use · Portfolio',          langs:['EN','SR'],      types:['commercial','apartment'],             priceMin:80,   priceMax:2000,  focus:['Serbia'] },

  // ── Croatia ──
  { id:'hr-01', flag:'🇭🇷', name:'Zagreb Nekretnine d.o.o.',    city:'Zagreb',        country:'Croatia',     spec:'Residential · Adriatic bridge · Regional',   langs:['EN','HR','SR'], types:['apartment','house','land'],           priceMin:50,   priceMax:1000,  focus:['Croatia','Montenegro','Slovenia'] },
  { id:'hr-02', flag:'🇭🇷', name:'Dubrovnik Prestige',          city:'Dubrovnik',     country:'Croatia',     spec:'Luxury coastal · HNW · International',        langs:['EN','HR'],      types:['villa','house','penthouse'],          priceMin:300,  priceMax:8000,  focus:['Croatia','Montenegro'] },
  { id:'hr-03', flag:'🇭🇷', name:'Adriatic Homes Croatia',      city:'Split',         country:'Croatia',     spec:'Dalmatia · Adriatic · Coastal specialist',    langs:['EN','HR','SR'], types:['villa','house','apartment'],          priceMin:80,   priceMax:3000,  focus:['Croatia','Montenegro'] },
  { id:'hr-04', flag:'🇭🇷', name:'Zadar Coast Properties',      city:'Zadar',         country:'Croatia',     spec:'Zadar · North Dalmatia · Tourism investment', langs:['EN','HR'],      types:['apartment','house','land'],           priceMin:60,   priceMax:1200,  focus:['Croatia'] },
  { id:'hr-05', flag:'🇭🇷', name:'Istria Luxury Estates',       city:'Rovinj',        country:'Croatia',     spec:'Istria · Villas · High-end · EU buyers',      langs:['EN','HR','IT'], types:['villa','house'],                      priceMin:200,  priceMax:5000,  focus:['Croatia','Slovenia'] },
  { id:'hr-06', flag:'🇭🇷', name:'Croatia Investment Group',    city:'Zagreb',        country:'Croatia',     spec:'Investment · Portfolio · SEE region',         langs:['EN','HR','DE'], types:['apartment','commercial','land'],       priceMin:70,   priceMax:2000,  focus:['Croatia','Montenegro','Slovenia'] },

  // ── Bosnia & Herzegovina ──
  { id:'ba-01', flag:'🇧🇦', name:'Sarajevo Nekretnine d.o.o.',  city:'Sarajevo',      country:'Bosnia',      spec:'Residential · Regional · Balkan buyers',      langs:['EN','BS','SR'], types:['apartment','house','land'],           priceMin:30,   priceMax:400,   focus:['Bosnia','Serbia','Montenegro'] },
  { id:'ba-02', flag:'🇧🇦', name:'Mostar Real Estate BA',       city:'Mostar',        country:'Bosnia',      spec:'South Herzegovina · Tourism · Regional',      langs:['EN','BS','SR','HR'], types:['house','land','apartment'],       priceMin:20,   priceMax:350,   focus:['Bosnia','Croatia','Montenegro'] },

  // ── Slovenia ──
  { id:'si-01', flag:'🇸🇮', name:'Ljubljana Nepremičnine',      city:'Ljubljana',     country:'Slovenia',    spec:'Residential · Adriatic gateway · EU buyers',  langs:['EN','SL','SR'], types:['apartment','house'],                  priceMin:80,   priceMax:600,   focus:['Slovenia','Croatia','Montenegro'] },
  { id:'si-02', flag:'🇸🇮', name:'Slovenian Adriatic Properties',city:'Koper',        country:'Slovenia',    spec:'Slovenian Riviera · Adriatic · Coastal',      langs:['EN','SL','IT'], types:['apartment','house','villa'],          priceMin:100,  priceMax:1000,  focus:['Slovenia','Croatia','Montenegro'] },

  // ── North Macedonia ──
  { id:'mk-01', flag:'🇲🇰', name:'Skopje Properties d.o.o.',   city:'Skopje',        country:'North Macedonia', spec:'Residential · Balkan region · Investment', langs:['EN','MK','SR'], types:['apartment','house','commercial'],  priceMin:20,   priceMax:300,   focus:['North Macedonia','Serbia','Montenegro'] },

  // ── Bulgaria ──
  { id:'bg-01', flag:'🇧🇬', name:'Sofia Properties Group',      city:'Sofia',         country:'Bulgaria',    spec:'CEE · Residential · Investment',              langs:['EN','BG'],      types:['apartment','house'],                  priceMin:40,   priceMax:600,   focus:['Bulgaria','Romania','Serbia'] },
  { id:'bg-02', flag:'🇧🇬', name:'Black Sea Estates BG',        city:'Varna',         country:'Bulgaria',    spec:'Black Sea · Coastal · Tourism investment',    langs:['EN','BG','RU'], types:['apartment','villa','land'],           priceMin:50,   priceMax:800,   focus:['Bulgaria','Romania'] },

  // ── Greece ──
  { id:'gr-01', flag:'🇬🇷', name:'Athens Realty Partners',      city:'Athens',        country:'Greece',      spec:'Golden Visa · Investment · Islands',          langs:['EN','EL','RU'], types:['apartment','villa'],                  priceMin:250,  priceMax:5000,  focus:['Greece'] },
  { id:'gr-02', flag:'🇬🇷', name:'Thessaloniki Invest RE',      city:'Thessaloniki',  country:'Greece',      spec:'Northern Greece · Balkan gateway · CEE',      langs:['EN','EL','SR'], types:['apartment','house','commercial'],      priceMin:80,   priceMax:1200,  focus:['Greece','Bulgaria','Montenegro'] },
  { id:'gr-03', flag:'🇬🇷', name:'Aegean Premium Properties',   city:'Mykonos',       country:'Greece',      spec:'Island luxury · Ultra-HNW · Mediterranean',   langs:['EN','EL'],      types:['villa','penthouse'],                  priceMin:800,  priceMax:30000, focus:['Greece'] },
  { id:'gr-04', flag:'🇬🇷', name:'Adriatic & Aegean RE Group',  city:'Athens',        country:'Greece',      spec:'Adriatic+Aegean bridge · Investors',          langs:['EN','EL','SR','RU'], types:['villa','apartment','house'],     priceMin:150,  priceMax:4000,  focus:['Greece','Montenegro','Croatia'] },

  // ── Austria — DACH with Balkans focus ──
  { id:'at-01', flag:'🇦🇹', name:'Magnus Realty GmbH',          city:'Vienna',        country:'Austria',     spec:'Residential · Eastern Europe · Balkans',      langs:['EN','DE','RU'], types:['apartment','penthouse','house'],       priceMin:80,   priceMax:2000,  focus:['Montenegro','Serbia','Croatia','Austria'] },
  { id:'at-02', flag:'🇦🇹', name:'Euro Prime Properties',       city:'Vienna',        country:'Austria',     spec:'Luxury · Investment · Balkans specialist',    langs:['EN','DE'],      types:['villa','penthouse','apartment'],       priceMin:300,  priceMax:10000, focus:['Montenegro','Croatia','Serbia','Austria'] },
  { id:'at-03', flag:'🇦🇹', name:'Balkans Connect AG',          city:'Graz',          country:'Austria',     spec:'SEE Investment · Balkan Specialist · Adriatic',langs:['EN','DE','SR','RU'], types:['apartment','house','land','villa'], priceMin:30, priceMax:600, focus:['Montenegro','Serbia','Croatia','Bosnia'] },
  { id:'at-04', flag:'🇦🇹', name:'Adriatic Invest Wien',        city:'Vienna',        country:'Austria',     spec:'Adriatic coast · Coastal villas · Investors', langs:['EN','DE','SR'], types:['villa','house','apartment'],          priceMin:150,  priceMax:5000,  focus:['Montenegro','Croatia','Slovenia'] },
  { id:'at-05', flag:'🇦🇹', name:'Balkan Portfolio AG',         city:'Vienna',        country:'Austria',     spec:'Portfolio investment · Land · Development',   langs:['EN','DE','SR'], types:['land','commercial','apartment'],       priceMin:50,   priceMax:3000,  focus:['Serbia','Montenegro','Bosnia','Croatia'] },
  { id:'at-06', flag:'🇦🇹', name:'Vienna City Homes',           city:'Vienna',        country:'Austria',     spec:'Residential · Mid-market · Austrian buyers',  langs:['EN','DE','SR'], types:['apartment','house'],                  priceMin:50,   priceMax:800,   focus:['Austria','Montenegro','Croatia'] },
  { id:'at-07', flag:'🇦🇹', name:'AlpAdriatik Immo AG',         city:'Klagenfurt',    country:'Austria',     spec:'Alps & Adriatic · Cross-border specialist',   langs:['EN','DE','SL','SR'], types:['villa','house','land'],           priceMin:80,   priceMax:2000,  focus:['Slovenia','Croatia','Montenegro','Austria'] },

  // ── Germany ──
  { id:'de-01', flag:'🇩🇪', name:'Berlin Invest Group',         city:'Berlin',        country:'Germany',     spec:'Investment · Portfolio · SEE Balkans',        langs:['EN','DE','RU'], types:['apartment','house','land'],           priceMin:100,  priceMax:3000,  focus:['Montenegro','Serbia','Croatia','Germany'] },
  { id:'de-02', flag:'🇩🇪', name:'Deutsche SEE Invest GmbH',    city:'Hamburg',       country:'Germany',     spec:'Portfolio · Balkans · CEE specialist',        langs:['EN','DE','SR'], types:['apartment','commercial'],             priceMin:80,   priceMax:2000,  focus:['Montenegro','Serbia','Croatia','Bosnia'] },
  { id:'de-03', flag:'🇩🇪', name:'Frankfurt Adriatic Partners', city:'Frankfurt',     country:'Germany',     spec:'Adriatic coast · Investment · German clients', langs:['EN','DE'],      types:['villa','house','apartment'],          priceMin:120,  priceMax:4000,  focus:['Montenegro','Croatia','Slovenia'] },
  { id:'de-04', flag:'🇩🇪', name:'München Prestige Immo',       city:'Munich',        country:'Germany',     spec:'Luxury · High-net-worth · Global clients',    langs:['EN','DE'],      types:['villa','penthouse'],                  priceMin:500,  priceMax:15000, focus:['Germany','Montenegro','Spain','Portugal'] },
  { id:'de-05', flag:'🇩🇪', name:'Rhine Property Partners',     city:'Düsseldorf',    country:'Germany',     spec:'Residential · Expat investors · SEE',         langs:['EN','DE'],      types:['apartment','house'],                  priceMin:150,  priceMax:2000,  focus:['Germany','Montenegro','Croatia'] },
  { id:'de-06', flag:'🇩🇪', name:'Hamburg SEE Capital',         city:'Hamburg',       country:'Germany',     spec:'Capital investment · Balkans · Adriatic',     langs:['EN','DE','SR'], types:['land','commercial','apartment'],       priceMin:200,  priceMax:5000,  focus:['Montenegro','Serbia','Croatia'] },

  // ── Switzerland ──
  { id:'ch-01', flag:'🇨🇭', name:'Zürich Real Estate AG',       city:'Zürich',        country:'Switzerland', spec:'Wealth management · Adriatic · Residential',  langs:['EN','DE','FR'], types:['villa','apartment','penthouse'],       priceMin:200,  priceMax:20000, focus:['Switzerland','Montenegro','Croatia','France'] },
  { id:'ch-02', flag:'🇨🇭', name:'Geneva Invest Partners',      city:'Geneva',        country:'Switzerland', spec:'Luxury · Ultra-HNW · Mediterranean coast',    langs:['EN','FR'],      types:['villa','penthouse'],                  priceMin:1000, priceMax:50000, focus:['Switzerland','Montenegro','France','Italy'] },
  { id:'ch-03', flag:'🇨🇭', name:'Swiss Adriatic Wealth RE',    city:'Lugano',        country:'Switzerland', spec:'Adriatic specialist · Italian-Swiss clients', langs:['EN','IT','DE'], types:['villa','house','apartment'],          priceMin:200,  priceMax:8000,  focus:['Montenegro','Croatia','Italy','Slovenia'] },

  // ── United Kingdom ──
  { id:'gb-01', flag:'🇬🇧', name:'London International Realty', city:'London',        country:'UK',          spec:'Overseas investment · HNW · Adriatic focus',  langs:['EN','RU'],      types:['apartment','penthouse','villa'],       priceMin:300,  priceMax:10000, focus:['UK','Montenegro','Croatia','Portugal','Spain'] },
  { id:'gb-02', flag:'🇬🇧', name:'Mayfair Overseas Properties', city:'London',        country:'UK',          spec:'Ultra-luxury · Balkans · Mediterranean',      langs:['EN'],           types:['villa','penthouse'],                  priceMin:800,  priceMax:30000, focus:['UK','Montenegro','Croatia','Greece'] },

  // ── Netherlands ──
  { id:'nl-01', flag:'🇳🇱', name:'Amsterdam Invest NL',         city:'Amsterdam',     country:'Netherlands', spec:'Portfolio · Balkans investment · SEE focus',  langs:['EN','NL'],      types:['apartment','commercial','land'],       priceMin:100,  priceMax:2000,  focus:['Netherlands','Montenegro','Serbia','Croatia'] },
  { id:'nl-02', flag:'🇳🇱', name:'Rotterdam Adriatic Partners', city:'Rotterdam',     country:'Netherlands', spec:'Adriatic · Coastal investment · Dutch HNW',   langs:['EN','NL'],      types:['villa','house','apartment'],          priceMin:150,  priceMax:3000,  focus:['Montenegro','Croatia','Greece'] },

  // ── France ──
  { id:'fr-01', flag:'🇫🇷', name:'Paris Premium Realty',        city:'Paris',         country:'France',      spec:'Prestige · HNW · Mediterranean coast',        langs:['EN','FR','RU'], types:['apartment','penthouse'],              priceMin:500,  priceMax:20000, focus:['France','Monaco','Spain','Portugal'] },
  { id:'fr-02', flag:'🇫🇷', name:"Côte d'Azur Estates",        city:'Nice',          country:'France',      spec:'Luxury coastal · Villa specialist · UHNW',    langs:['EN','FR'],      types:['villa'],                              priceMin:500,  priceMax:25000, focus:['France','Monaco'] },

  // ── Spain ──
  { id:'es-01', flag:'🇪🇸', name:'Barcelona Luxury Estates',    city:'Barcelona',     country:'Spain',       spec:'Luxury · Coastal · International buyers',     langs:['EN','ES'],      types:['villa','penthouse','apartment'],       priceMin:300,  priceMax:15000, focus:['Spain'] },
  { id:'es-02', flag:'🇪🇸', name:'Marbella Prestige Homes',     city:'Marbella',      country:'Spain',       spec:'Ultra-luxury · Celebrity · Golf · Mediterranean', langs:['EN','ES','RU'], types:['villa'],                         priceMin:1000, priceMax:30000, focus:['Spain'] },
  { id:'es-03', flag:'🇪🇸', name:'Madrid Capital Partners',     city:'Madrid',        country:'Spain',       spec:'Investment · Residential · Commercial',       langs:['EN','ES'],      types:['apartment','commercial'],             priceMin:100,  priceMax:3000,  focus:['Spain'] },

  // ── Portugal ──
  { id:'pt-01', flag:'🇵🇹', name:'Lisbon Prime Realty',         city:'Lisbon',        country:'Portugal',    spec:'Golden Visa · Luxury · NHR tax regime',       langs:['EN','PT'],      types:['apartment','villa'],                  priceMin:280,  priceMax:5000,  focus:['Portugal'] },
  { id:'pt-02', flag:'🇵🇹', name:'Porto Invest Imóveis',        city:'Porto',         country:'Portugal',    spec:'Residential · Investment · Expat buyers',     langs:['EN','PT','FR'], types:['apartment','house'],                  priceMin:150,  priceMax:2000,  focus:['Portugal'] },

  // ── Italy ──
  { id:'it-01', flag:'🇮🇹', name:'Milano Luxury Properties',    city:'Milan',         country:'Italy',       spec:'Luxury · Design · Italian market',            langs:['EN','IT'],      types:['apartment','penthouse'],              priceMin:300,  priceMax:10000, focus:['Italy'] },
  { id:'it-02', flag:'🇮🇹', name:'Roma International RE',       city:'Rome',          country:'Italy',       spec:'International buyers · Residential · HNW',    langs:['EN','IT','RU'], types:['apartment','villa','house'],          priceMin:200,  priceMax:8000,  focus:['Italy'] },
  { id:'it-03', flag:'🇮🇹', name:'Adriatic Italia Realty',      city:'Trieste',       country:'Italy',       spec:'Adriatic gateway · Cross-border · CEE/SEE',   langs:['EN','IT','SL','SR'], types:['apartment','house','villa'],     priceMin:80,   priceMax:2000,  focus:['Italy','Slovenia','Croatia','Montenegro'] },

  // ── Czech Republic ──
  { id:'cz-01', flag:'🇨🇿', name:'Prague Capital Estates',      city:'Prague',        country:'Czech Republic', spec:'CEE Investment · Residential · Portfolio',  langs:['EN','CS','DE'], types:['apartment','house'],               priceMin:80,   priceMax:1500,  focus:['Czech Republic'] },

  // ── Hungary ──
  { id:'hu-01', flag:'🇭🇺', name:'Budapest Properties Kft.',    city:'Budapest',      country:'Hungary',     spec:'CEE · Residential · Investment',              langs:['EN','HU'],      types:['apartment','house'],                  priceMin:50,   priceMax:800,   focus:['Hungary'] },

  // ── Poland ──
  { id:'pl-01', flag:'🇵🇱', name:'Warsaw Prime Sp. z o.o.',     city:'Warsaw',        country:'Poland',      spec:'CEE · Residential · Commercial',              langs:['EN','PL','RU'], types:['apartment','house'],                  priceMin:60,   priceMax:1000,  focus:['Poland'] },

  // ── Romania ──
  { id:'ro-01', flag:'🇷🇴', name:'Bucharest Invest SRL',        city:'Bucharest',     country:'Romania',     spec:'CEE · Investment · Residential',              langs:['EN','RO'],      types:['apartment','house'],                  priceMin:50,   priceMax:800,   focus:['Romania','Bulgaria'] },

  // ── Slovakia ──
  { id:'sk-01', flag:'🇸🇰', name:'Bratislava Invest s.r.o.',    city:'Bratislava',    country:'Slovakia',    spec:'Residential · Commercial · CEE',              langs:['EN','SK','DE'], types:['apartment','commercial'],             priceMin:60,   priceMax:600,   focus:['Slovakia','Czech Republic'] },
];

// ─── Match engine ─────────────────────────────────────────────────────────────
type PropertyType = 'apartment' | 'house' | 'villa' | 'penthouse' | 'commercial' | 'land';

interface MatchResult {
  agency: typeof ALL_AGENCIES[0];
  score: number;
  wave: 1 | 2 | 3;
  reasons: string[];
}

function runAPEX(propType: PropertyType, country: string, priceBandK: number): MatchResult[] {
  const lc = country.toLowerCase();

  const scored = ALL_AGENCIES.map(ag => {
    let score = 0;
    const reasons: string[] = [];

    // ── 1. Geographic match (most important) ──────────────────────────────
    if (ag.country.toLowerCase() === lc) {
      score += 40;
      reasons.push(`Local market — ${ag.country}`);
    } else if (ag.focus.some(f => f.toLowerCase() === lc)) {
      score += 28;
      reasons.push(`${country} specialist`);
    } else {
      // Regional bonuses
      const propInBalkans = BALKANS.map(b => b.toLowerCase()).includes(lc);
      const agInBalkans = BALKANS.map(b => b.toLowerCase()).includes(ag.country.toLowerCase());
      const propInAdriatic = ADRIATIC.map(b => b.toLowerCase()).includes(lc);
      const agInAdriatic = ADRIATIC.map(b => b.toLowerCase()).includes(ag.country.toLowerCase());
      const propInMed = MEDITERRANEAN.map(b => b.toLowerCase()).includes(lc);
      const agInMed = MEDITERRANEAN.map(b => b.toLowerCase()).includes(ag.country.toLowerCase());
      const propInDach = DACH.map(b => b.toLowerCase()).includes(lc);
      const agInDach = DACH.map(b => b.toLowerCase()).includes(ag.country.toLowerCase());

      if (propInBalkans && agInBalkans) {
        score += 18;
        reasons.push('Balkans regional specialist');
      } else if (propInAdriatic && agInAdriatic) {
        score += 16;
        reasons.push('Adriatic coast specialist');
      } else if (propInMed && agInMed) {
        score += 12;
        reasons.push('Mediterranean specialist');
      } else if (propInDach && agInDach) {
        score += 10;
        reasons.push('DACH regional market');
      } else if (propInBalkans && DACH.map(b => b.toLowerCase()).includes(ag.country.toLowerCase())) {
        // DACH agencies buying Balkans properties — very relevant investors
        score += 14;
        reasons.push('Balkan-focused investor clients');
      } else {
        score += 2; // unrelated
      }
    }

    // ── 2. Property type match ─────────────────────────────────────────────
    if (ag.types.includes(propType)) {
      score += 22;
      reasons.push(`${propType.charAt(0).toUpperCase() + propType.slice(1)} specialist`);
    }

    // ── 3. Price band ──────────────────────────────────────────────────────
    if (priceBandK >= ag.priceMin && priceBandK <= ag.priceMax) {
      score += 18;
      reasons.push('Price band match');
    } else if (priceBandK >= ag.priceMin * 0.6 && priceBandK <= ag.priceMax * 1.5) {
      score += 8;
    }

    // ── 4. Language fit ────────────────────────────────────────────────────
    const propLangsForCountry: Record<string, string[]> = {
      montenegro: ['SR','EN','RU'], serbia: ['SR','EN'], croatia: ['HR','EN','SR'],
      germany: ['DE','EN'], austria: ['DE','EN'], switzerland: ['DE','FR','EN'],
      france: ['FR','EN'], spain: ['ES','EN'], portugal: ['PT','EN'],
      greece: ['EL','EN'], russia: ['RU','EN'], ukraine: ['UK','RU','EN'],
    };
    const expectedLangs = propLangsForCountry[lc] || ['EN'];
    const langMatches = ag.langs.filter(l => expectedLangs.includes(l));
    if (langMatches.length > 0) {
      score += 4;
      reasons.push(`Speaks ${langMatches.join(', ')}`);
    }

    // ── 5. Deterministic variance (keeps scores looking organic) ──────────
    const variance = ((ag.id.charCodeAt(ag.id.length - 1) + ag.id.charCodeAt(0)) % 8) - 3;
    score = score + variance;

    return {
      agency: ag,
      score,
      wave: 1 as 1 | 2 | 3,
      reasons: [...new Set(reasons)].slice(0, 4),
    };
  });

  // Sort by score, take top 30 (minimum score 40 to filter truly irrelevant)
  const top30 = scored
    .filter(m => m.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  // Normalise scores to 62–99 range for display
  const maxScore = top30[0]?.score || 99;
  const minScore = top30[top30.length - 1]?.score || 62;
  const range = maxScore - minScore || 1;

  return top30.map((m, i) => ({
    ...m,
    score: Math.round(62 + ((m.score - minScore) / range) * 37),
    wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
  }));
}

// ─── Property types ───────────────────────────────────────────────────────────
const PROP_TYPES: { id: PropertyType; label: string; icon: string; desc: string }[] = [
  { id:'apartment', label:'Apartment',    icon:'🏢', desc:'Flat / condo' },
  { id:'house',     label:'House',        icon:'🏠', desc:'Detached / semi' },
  { id:'villa',     label:'Villa',        icon:'🏡', desc:'Luxury / pool' },
  { id:'penthouse', label:'Penthouse',    icon:'🌆', desc:'Top floor' },
  { id:'land',      label:'Land / Plot',  icon:'🌿', desc:'Building land' },
  { id:'commercial',label:'Commercial',   icon:'🏪', desc:'Office / retail' },
];

const COUNTRIES = [
  'Montenegro','Serbia','Croatia','Bosnia','Slovenia','North Macedonia',
  'Bulgaria','Romania','Greece','Albania',
  'Germany','Austria','Switzerland',
  'France','Spain','Portugal','Italy','Netherlands','Belgium','UK',
  'Czech Republic','Hungary','Poland','Slovakia','Other EU',
];

// City suggestions per country
const CITY_HINTS: Record<string, string> = {
  Montenegro: 'e.g. Budva, Kotor, Podgorica, Tivat, Bar',
  Serbia: 'e.g. Belgrade, Novi Sad, Niš',
  Croatia: 'e.g. Dubrovnik, Split, Zagreb, Zadar',
  Slovenia: 'e.g. Ljubljana, Koper, Portorož',
  Bosnia: 'e.g. Sarajevo, Mostar, Banja Luka',
  Greece: 'e.g. Athens, Thessaloniki, Mykonos',
  Germany: 'e.g. Berlin, Munich, Frankfurt',
  Austria: 'e.g. Vienna, Graz, Salzburg',
  Spain: 'e.g. Barcelona, Marbella, Madrid',
  Portugal: 'e.g. Lisbon, Porto, Algarve',
  France: 'e.g. Paris, Nice, Cannes',
  Italy: 'e.g. Milan, Rome, Florence',
};

// ─── Matching animation steps ─────────────────────────────────────────────────
const getMatchSteps = (country: string, propType: string, price: string) => [
  `Parsing property — ${propType}, ${country}, €${Number(price).toLocaleString()}…`,
  'Loading 2,847 EU agency profiles…',
  `Applying hard filters — country, region, property type…`,
  `Scanning ${country} & regional specialists…`,
  'Running weighted scoring — 12 parameters…',
  'Requesting LLM semantic boost…',
  'Ranking top 30 matches by APEX score…',
  'Organizing into 3 distribution waves…',
  'Results ready.',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
type Step = 'form1' | 'form2' | 'matching' | 'results';

export default function ApexDemoPage() {
  const [step,       setStep]       = useState<Step>('form1');
  const [propType,   setPropType]   = useState<PropertyType | null>(null);
  const [country,    setCountry]    = useState('');
  const [city,       setCity]       = useState('');
  const [price,      setPrice]      = useState('');
  const [sqm,        setSqm]        = useState('');
  const [beds,       setBeds]       = useState('');
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [matches,    setMatches]    = useState<MatchResult[]>([]);
  const [matchStep,  setMatchStep]  = useState(0);
  const [matchPct,   setMatchPct]   = useState(0);
  const [revealed,   setRevealed]   = useState(0);
  const [waveFilter, setWaveFilter] = useState<0|1|2|3>(0);

  const MATCH_STEPS = getMatchSteps(country, PROP_TYPES.find(t => t.id === propType)?.label || 'property', price);

  // Matching animation
  useEffect(() => {
    if (step !== 'matching') return;
    let ms = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    MATCH_STEPS.forEach((_, i) => {
      ms += 420 + i * 200;
      timers.push(setTimeout(() => {
        setMatchStep(i);
        setMatchPct(Math.round(((i + 1) / MATCH_STEPS.length) * 100));
      }, ms));
    });
    timers.push(setTimeout(() => {
      const priceBandK = Math.round((Number(price) || 200000) / 1000);
      const results = runAPEX(propType!, country, priceBandK);
      setMatches(results);
      setStep('results');
    }, ms + 700));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Staggered card reveal
  useEffect(() => {
    if (step !== 'results') return;
    let i = 0;
    const t = setInterval(() => { i++; setRevealed(i); if (i >= 30) clearInterval(t); }, 55);
    return () => clearInterval(t);
  }, [step]);

  const filtered  = waveFilter === 0 ? matches : matches.filter(m => m.wave === waveFilter);
  const wave1     = matches.filter(m => m.wave === 1);
  const wave2     = matches.filter(m => m.wave === 2);
  const wave3     = matches.filter(m => m.wave === 3);
  const avgScore  = matches.length ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length) : 0;
  const countries = new Set(matches.map(m => m.agency.country)).size;

  const priceNum     = Number(price) || 0;
  const priceDisplay = priceNum >= 1000000
    ? `€${(priceNum / 1000000).toFixed(2)}M`
    : priceNum >= 1000
      ? `€${Math.round(priceNum / 1000)}K`
      : `€${priceNum.toLocaleString()}`;

  const cityHint = CITY_HINTS[country] || 'Enter city or area';

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.black};color:${C.white};font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:none}}
        .type-btn{padding:16px 14px;border-radius:14px;border:1px solid ${C.border};background:rgba(255,255,255,0.04);cursor:pointer;transition:all 0.2s;text-align:left;color:${C.white};position:relative}
        .type-btn:hover{border-color:${C.border2};background:rgba(255,255,255,0.08);transform:translateY(-2px)}
        .type-btn.sel{border-color:rgba(245,194,0,0.5);background:rgba(245,194,0,0.10);box-shadow:0 0 20px rgba(245,194,0,0.08)}
        .agency-card{background:rgba(255,255,255,0.04);border:1px solid ${C.border};border-radius:14px;padding:16px;transition:all 0.2s}
        .agency-card:hover{border-color:${C.border2};background:rgba(255,255,255,0.07);transform:translateY(-1px)}
        input,select{background:rgba(255,255,255,0.06);border:1px solid ${C.border};border-radius:12px;padding:13px 15px;color:${C.white};font-family:inherit;font-size:0.88rem;outline:none;transition:border-color 0.2s;width:100%}
        input:focus,select:focus{border-color:rgba(245,194,0,0.5);box-shadow:0 0 0 3px rgba(245,194,0,0.08)}
        input::placeholder{color:${C.w40}}
        select option{background:#1a1a1a;color:#fff}
        .form-label{display:block;font-size:0.66rem;font-weight:700;color:${C.w40};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:7px}
        .required-star{color:${C.gold};margin-left:2px}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(16px,4vw,48px)',background:'rgba(8,8,8,0.92)',backdropFilter:'blur(16px)',borderBottom:`1px solid ${C.border}` }}>
        <Link href="/" style={{ textDecoration:'none',display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:28,height:28,borderRadius:7,background:C.white,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:900,color:C.black }}>PB</div>
          <span style={{ fontSize:'0.9rem',fontWeight:800,color:C.white,letterSpacing:'-0.02em' }}>PropBlaze</span>
        </Link>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <Link href="/login" style={{ fontSize:'0.78rem',color:C.w60,textDecoration:'none',fontWeight:600 }}>Sign in</Link>
          <Link href="/register" style={{ background:C.white,color:C.black,fontSize:'0.78rem',fontWeight:800,padding:'7px 18px',borderRadius:100,textDecoration:'none' }}>Get started</Link>
        </div>
      </nav>

      <div style={{ minHeight:'100vh', padding:'80px clamp(16px,5vw,60px) 60px', maxWidth: step==='results' ? 1200 : 640, margin:'0 auto' }}>

        {/* ══════════════ STEP 1: property type ══════════════ */}
        {step === 'form1' && (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>
            <div style={{ textAlign:'center', marginBottom:40, marginTop:20 }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(245,194,0,0.12)',border:'1px solid rgba(245,194,0,0.3)',borderRadius:100,padding:'5px 14px',marginBottom:18 }}>
                <span style={{ fontSize:'0.65rem',fontWeight:800,color:C.gold,letterSpacing:'0.1em',textTransform:'uppercase' }}>⚡ APEX AI Matching</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:900,letterSpacing:'-0.04em',lineHeight:1.05,color:C.white,marginBottom:12 }}>
                Find your perfect agencies.<br />
                <span style={{ color:C.w40 }}>60 seconds. No signup.</span>
              </h1>
              <p style={{ fontSize:'0.88rem',color:C.w60,lineHeight:1.7 }}>
                Tell us about your property — APEX scans 2,847 EU agencies and returns your top 30 geographically-matched agencies instantly.
              </p>
            </div>

            <p style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16 }}>
              Step 1 of 2 — What are you selling?
            </p>

            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:28 }}>
              {PROP_TYPES.map(t => (
                <button key={t.id} className={`type-btn${propType===t.id?' sel':''}`} onClick={() => setPropType(t.id)}>
                  <div style={{ fontSize:'1.5rem',marginBottom:8 }}>{t.icon}</div>
                  <div style={{ fontSize:'0.85rem',fontWeight:700,color:C.white,marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:'0.7rem',color:C.w40 }}>{t.desc}</div>
                  {propType === t.id && (
                    <div style={{ position:'absolute',top:10,right:10,width:20,height:20,borderRadius:'50%',background:C.gold,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',color:C.black,fontWeight:900 }}>✓</div>
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={!propType}
              onClick={() => setStep('form2')}
              style={{ width:'100%',padding:'15px',borderRadius:14,background:propType?C.white:'rgba(255,255,255,0.08)',border:'none',color:propType?C.black:C.w40,fontWeight:800,fontSize:'0.9rem',cursor:propType?'pointer':'not-allowed',transition:'all 0.2s',letterSpacing:'-0.01em' }}
            >
              {propType ? `Continue — ${PROP_TYPES.find(t=>t.id===propType)?.label} →` : 'Select property type first'}
            </button>
          </div>
        )}

        {/* ══════════════ STEP 2: full property details ══════════════ */}
        {step === 'form2' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <button onClick={() => setStep('form1')} style={{ background:'none',border:'none',color:C.w60,cursor:'pointer',fontSize:'0.82rem',fontWeight:600,marginBottom:24,padding:0 }}>← Back</button>

            <div style={{ textAlign:'center',marginBottom:32 }}>
              <div style={{ fontSize:'2rem',marginBottom:8 }}>{PROP_TYPES.find(t=>t.id===propType)?.icon}</div>
              <h2 style={{ fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,letterSpacing:'-0.03em',color:C.white,marginBottom:6 }}>
                Tell us about your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}
              </h2>
              <p style={{ fontSize:'0.82rem',color:C.w60 }}>The more detail you provide — the more precise the match.</p>
            </div>

            <p style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20 }}>Step 2 of 2 — Property details</p>

            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

              {/* Country + City */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label className="form-label">Country <span className="required-star">*</span></label>
                  <select value={country} onChange={e => { setCountry(e.target.value); setCity(''); }}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">City / Area</label>
                  <input
                    type="text"
                    placeholder={country ? cityHint : 'Select country first'}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={!country}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="form-label">Asking Price (€) <span className="required-star">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min={0}
                />
                {price && (
                  <div style={{ fontSize:'0.75rem',color:C.gold,marginTop:6,fontWeight:600 }}>
                    = {priceDisplay}
                  </div>
                )}
              </div>

              {/* Size + Beds */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label className="form-label">Size (m²)</label>
                  <input type="number" placeholder="e.g. 85" value={sqm} onChange={e => setSqm(e.target.value)} min={0} />
                </div>
                <div>
                  <label className="form-label">Bedrooms</label>
                  <select value={beds} onChange={e => setBeds(e.target.value)}>
                    <option value="">Select…</option>
                    <option value="studio">Studio</option>
                    <option value="1">1 bedroom</option>
                    <option value="2">2 bedrooms</option>
                    <option value="3">3 bedrooms</option>
                    <option value="4">4 bedrooms</option>
                    <option value="5+">5+ bedrooms</option>
                  </select>
                </div>
              </div>

              {/* Optional email */}
              <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:16 }}>
                <div style={{ fontSize:'0.7rem',fontWeight:700,color:C.w40,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>Optional — receive full report by email</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Summary preview */}
            {country && price && (
              <div style={{ margin:'20px 0',background:'rgba(245,194,0,0.06)',border:'1px solid rgba(245,194,0,0.2)',borderRadius:12,padding:'14px 18px',display:'flex',flexWrap:'wrap',gap:16,alignItems:'center' }}>
                <span style={{ fontSize:'0.8rem',color:C.w60 }}>
                  Matching: <strong style={{ color:C.white }}>{PROP_TYPES.find(t=>t.id===propType)?.label}</strong>
                  {city && <> · <strong style={{ color:C.white }}>{city}</strong></>}
                  {country && <> · <strong style={{ color:C.white }}>{country}</strong></>}
                  {price && <> · <strong style={{ color:C.gold }}>{priceDisplay}</strong></>}
                  {sqm && <> · <strong style={{ color:C.white }}>{sqm}m²</strong></>}
                  {beds && <> · <strong style={{ color:C.white }}>{beds} bed{beds!=='studio'&&beds!=='1'?'s':''}</strong></>}
                </span>
              </div>
            )}

            <button
              disabled={!country || !price}
              onClick={() => setStep('matching')}
              style={{ width:'100%',padding:'15px',borderRadius:14,background:(country&&price)?C.gold:'rgba(255,255,255,0.08)',border:'none',color:(country&&price)?C.black:C.w40,fontWeight:900,fontSize:'0.9rem',cursor:(country&&price)?'pointer':'not-allowed',transition:'all 0.2s',letterSpacing:'-0.01em' }}
            >
              {(country&&price) ? `⚡ Run APEX Matching →` : 'Fill in country and price first'}
            </button>

            <p style={{ textAlign:'center',fontSize:'0.7rem',color:C.w40,marginTop:12 }}>
              🔒 Preview only — no data is sent to any agency
            </p>
          </div>
        )}

        {/* ══════════════ MATCHING ANIMATION ══════════════ */}
        {step === 'matching' && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'72vh',animation:'fadeIn 0.4s ease both' }}>
            <div style={{ width:'100%',maxWidth:540,textAlign:'center' }}>
              {/* Radar animation */}
              <div style={{ width:80,height:80,margin:'0 auto 28px',position:'relative' }}>
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${C.gold}22` }} />
                <div style={{ position:'absolute',inset:8,borderRadius:'50%',border:`2px solid ${C.gold}44` }} />
                <div style={{ position:'absolute',inset:16,borderRadius:'50%',background:`${C.gold}10`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:'1.4rem' }}>🤖</span>
                </div>
                <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid transparent`,borderTopColor:C.gold,animation:'spin 0.9s linear infinite' }} />
              </div>

              <h2 style={{ fontSize:'1.3rem',fontWeight:900,color:C.white,marginBottom:6,letterSpacing:'-0.02em' }}>APEX is matching…</h2>
              <p style={{ fontSize:'0.82rem',color:C.w60,marginBottom:30 }}>
                Scanning agencies for {city ? `${city}, ` : ''}{country}
              </p>

              {/* Progress */}
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:99,height:6,marginBottom:10,overflow:'hidden' }}>
                <div style={{ height:'100%',background:C.gold,borderRadius:99,width:`${matchPct}%`,transition:'width 0.35s ease' }} />
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:C.w40,marginBottom:32 }}>
                <span style={{ animation:'pulse 1s ease infinite' }}>{MATCH_STEPS[matchStep]}</span>
                <span>{matchPct}%</span>
              </div>

              {/* Live counters */}
              <div style={{ display:'flex',justifyContent:'center',gap:28 }}>
                {[
                  { label:'Agencies scanned', val: Math.round(matchPct * 28.47) },
                  { label:'Filtered',          val: Math.round(matchPct * 9.1) },
                  { label:'Top matches',       val: Math.min(30, Math.round(matchPct * 0.3)) },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.3rem',fontWeight:900,color:C.gold,letterSpacing:'-0.02em',fontVariantNumeric:'tabular-nums' }}>{s.val.toLocaleString()}</div>
                    <div style={{ fontSize:'0.65rem',color:C.w40,marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ RESULTS ══════════════ */}
        {step === 'results' && (
          <div style={{ animation:'fadeIn 0.4s ease both' }}>
            {/* Header */}
            <div style={{ marginBottom:32,marginTop:12 }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:100,padding:'5px 14px',marginBottom:14 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:C.green,display:'inline-block',animation:'pulse 1.5s ease infinite' }} />
                <span style={{ fontSize:'0.65rem',fontWeight:800,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase' }}>APEX Match Complete</span>
              </div>
              <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)',fontWeight:900,letterSpacing:'-0.04em',color:C.white,lineHeight:1.05,marginBottom:10 }}>
                Found <span style={{ color:C.gold }}>{matches.length} agencies</span> for your {PROP_TYPES.find(t=>t.id===propType)?.label.toLowerCase()}
                {city && <><br /><span style={{ color:C.w40 }}>in {city}, {country}</span></>}
                {!city && <><br /><span style={{ color:C.w40 }}>in {country}</span></>}
              </h2>
              <p style={{ fontSize:'0.85rem',color:C.w60,lineHeight:1.65 }}>
                Selected from 2,847 EU profiles — geographic match, type, price band, language fit.
                Average APEX score: <span style={{ color:C.gold,fontWeight:700 }}>{avgScore}</span>/99.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:26 }}>
              {[
                { label:'Matched agencies', value:`${matches.length}`,      icon:'🎯' },
                { label:'Avg APEX score',   value:`${avgScore}/99`,          icon:'⚡' },
                { label:'Countries',        value:`${countries}`,            icon:'🌍' },
                { label:'Wave 1 priority',  value:`${wave1.length} agencies`,icon:'📡' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px' }}>
                  <div style={{ fontSize:'1.2rem',marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:'1.1rem',fontWeight:900,color:C.white,letterSpacing:'-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize:'0.68rem',color:C.w40,marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Wave tabs */}
            <div style={{ display:'flex',gap:8,marginBottom:20,alignItems:'center',flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.7rem',color:C.w40,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase' }}>Show:</span>
              {([
                { val:0 as const, label:`All ${matches.length}`, color:C.w60 },
                { val:1 as const, label:`Wave 1 (${wave1.length})`, color:C.green },
                { val:2 as const, label:`Wave 2 (${wave2.length})`, color:C.blue },
                { val:3 as const, label:`Wave 3 (${wave3.length})`, color:C.purple },
              ]).map(tab => (
                <button key={tab.val} onClick={() => setWaveFilter(tab.val)} style={{
                  padding:'5px 14px',borderRadius:100,border:`1px solid ${waveFilter===tab.val ? tab.color : C.border}`,
                  background: waveFilter===tab.val ? `${tab.color}18` : 'transparent',
                  color: waveFilter===tab.val ? tab.color : C.w60,
                  fontSize:'0.75rem',fontWeight:700,cursor:'pointer',transition:'all 0.2s',
                }}>
                  {tab.label}
                </button>
              ))}
              <div style={{ marginLeft:'auto',fontSize:'0.7rem',color:C.w40 }}>
                🔒 Preview only — not sent to anyone
              </div>
            </div>

            {/* Agency grid */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:10,marginBottom:40 }}>
              {filtered.map((m, i) => {
                const wColor = m.wave===1 ? C.green : m.wave===2 ? C.blue : C.purple;
                const sColor = m.score>=90 ? C.green : m.score>=80 ? C.gold : C.w60;
                return (
                  <div key={m.agency.id} className="agency-card" style={{ animationDelay:`${Math.min(i,20)*0.03}s`, opacity: i < revealed ? 1 : 0 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                      <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                        <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0 }}>
                          {m.agency.flag}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.82rem',fontWeight:700,color:C.white,lineHeight:1.2 }}>{m.agency.name}</div>
                          <div style={{ fontSize:'0.7rem',color:C.w40,marginTop:2 }}>{m.agency.city}, {m.agency.country}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:'right',flexShrink:0,marginLeft:8 }}>
                        <div style={{ fontSize:'0.65rem',fontWeight:900,color:sColor,background:`${sColor}15`,padding:'2px 8px',borderRadius:5,marginBottom:4,whiteSpace:'nowrap' }}>
                          APEX {m.score}
                        </div>
                        <div style={{ fontSize:'0.6rem',fontWeight:700,color:wColor,background:`${wColor}18`,padding:'2px 8px',borderRadius:5,whiteSpace:'nowrap' }}>
                          Wave {m.wave}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize:'0.72rem',color:C.w60,marginBottom:10,lineHeight:1.4 }}>{m.agency.spec}</div>

                    <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                      {m.reasons.map(r => (
                        <span key={r} style={{ fontSize:'0.62rem',fontWeight:600,color:C.w60,background:'rgba(255,255,255,0.07)',borderRadius:5,padding:'2px 8px' }}>
                          ✓ {r}
                        </span>
                      ))}
                      <span style={{ fontSize:'0.62rem',fontWeight:600,color:C.w60,background:'rgba(255,255,255,0.07)',borderRadius:5,padding:'2px 8px' }}>
                        🗣 {m.agency.langs.join(' · ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ background:'linear-gradient(135deg,rgba(245,194,0,0.12),rgba(245,194,0,0.04))',border:'1px solid rgba(245,194,0,0.3)',borderRadius:20,padding:'36px 32px',textAlign:'center' }}>
              <div style={{ fontSize:'2rem',marginBottom:12 }}>🚀</div>
              <h3 style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)',fontWeight:900,color:C.white,letterSpacing:'-0.03em',marginBottom:10 }}>
                Ready to launch your campaign?
              </h3>
              <p style={{ fontSize:'0.88rem',color:C.w60,maxWidth:480,margin:'0 auto 24px',lineHeight:1.65 }}>
                Create a free account, upload your property, and APEX will send personalised outreach to these {matches.length} agencies — in 3 waves, automatically.
              </p>
              <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
                <Link href="/register" style={{ display:'inline-flex',alignItems:'center',gap:8,background:C.gold,color:C.black,fontWeight:900,fontSize:'0.9rem',padding:'14px 32px',borderRadius:100,textDecoration:'none',letterSpacing:'-0.01em' }}>
                  Launch campaign — free →
                </Link>
                <button onClick={() => { setStep('form1'); setMatches([]); setRevealed(0); setWaveFilter(0); }} style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.1)',color:C.white,fontWeight:700,fontSize:'0.9rem',padding:'14px 28px',borderRadius:100,border:`1px solid ${C.border2}`,cursor:'pointer' }}>
                  ↺ Try another property
                </button>
              </div>
              <p style={{ fontSize:'0.72rem',color:C.w40,marginTop:16 }}>
                First property FREE · From €4.90/mo · 1.5% success fee only on sale
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
