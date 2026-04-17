import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Search, AlertCircle, RefreshCw, ChevronDown, Tag, Gift, MessageCircle, Copy, 
  ArrowUp, Check, Menu, Calendar, ShieldAlert, Youtube, Zap, Camera, 
  CreditCard, TrendingUp, X, Calculator, Percent, Layers, Box, Wallet, 
  Minus, Plus, IndianRupee, Star, ChevronLeft, ArrowRight, ClipboardList, 
  Smartphone, LogIn, Lock, Eye, EyeOff, Archive, PackageOpen, ArrowDown,
  Home, Maximize, WifiOff, Download
} from 'lucide-react';

const CustomSamsungIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4.5" y="1.5" width="15" height="21" rx="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8.5" cy="5.5" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="9" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="12.5" r="1.2" fill="currentColor" />
    <circle cx="11.5" cy="7" r="0.7" fill="currentColor" />
  </svg>
);

const BASE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1uipnUzwMNwBJWRJ6qhp4RPnlpuBHwYGaWbwEsmatHJY/export?format=csv&gid=";
const IMAGE_DB_URL = "https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=0";
const INVENTORY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1OR61dDEtCan2CufmV4UXYtLtQIFuX0MTSIKMJ9kA_RU/export?format=csv&gid=1255047374";
const COLOR_STOCK_SHEET_URL = "https://docs.google.com/spreadsheets/d/1OR61dDEtCan2CufmV4UXYtLtQIFuX0MTSIKMJ9kA_RU/export?format=csv&gid=904395252";
const NOTICE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=689704684";
const ADMIN_WHATSAPP_NUMBER = "918888851642"; 
const AUTH_SHEET_GID = "1959501734"; 
const AUTH_SHEET_URL = `https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=${AUTH_SHEET_GID}`;
const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VaxSwIM9Bb60YWXF8C3v";

const SHEET_TABS = [
  { name: 'A Series', gid: '2014959364' },
  { name: 'S & FE Series', gid: '2085730153' },
  { name: 'M & F Series', gid: '327181163' },
  { name: 'Tab Series', gid: '255331010' },
  { name: 'Gear Bud', gid: '596867009' }
];

const SamAssistIcon = ({ size = 28, className = "" }) => (
  <div className={`bg-gradient-to-br from-indigo-600 to-violet-800 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30 ${className}`} style={{ width: size, height: size, minWidth: size }}>
    <IndianRupee size={size * 0.55} strokeWidth={3} />
  </div>
);

// Helpers
const isValidDiscount = (val) => {
  if (!val) return false;
  const str = String(val).trim().toUpperCase();
  return str !== '0' && str !== '-' && str !== 'NA' && str !== 'NULL' && str !== 'NO CASHBACK' && str !== '';
};

const isComboOffer = (val) => {
  if (!val) return false;
  return String(val).toUpperCase().replace(/\s+/g, '').includes('+BCB');
};

const splitAmountAndDesc = (text) => {
  if (!text) return { amount: '', desc: '' };
  const str = String(text).trim();
  const match = str.match(/^((?:rs\.?|inr|₹)?\s*\d+[\d,]*\.?\d*)\s*(.*)$/i);
  if (match) return { amount: match[1].trim(), desc: match[2].trim() };
  return { amount: str, desc: '' };
};

const formatSafePrice = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (/\d/.test(str) && !str.includes('₹')) return `₹${str}`;
  return str;
};

const splitModelName = (fullName) => {
  if (!fullName) return { main: '', sub: '' };
  const str = String(fullName).trim();
  const firstParenIndex = str.indexOf('(');
  if (firstParenIndex !== -1) {
    const main = str.substring(0, firstParenIndex).trim();
    const sub = str.substring(firstParenIndex).trim();
    return { main, sub };
  }
  return { main: str, sub: '' };
};

const parsePriceToNumber = (priceStr) => {
  if (!priceStr) return 0;
  const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (num) => {
  const value = Number(num);
  if (isNaN(value) || value === 0) return '₹0';
  return '₹' + value.toLocaleString('en-IN');
};

const csvToArray = (text) => {
  const result = []; let row = []; let inQuotes = false; let val = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i]; const nextChar = text[i + 1];
    if (char === '"' && inQuotes && nextChar === '"') { val += '"'; i++; } 
    else if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { row.push(val); val = ""; } 
    else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(val); if (row.length > 0 || val.trim() !== "") result.push(row); row = []; val = "";
    } else val += char;
  }
  if (val || row.length > 0) { row.push(val); result.push(row); }
  return result;
};

const calculateStockAge = (dateStr) => {
  if (!dateStr || dateStr.toLowerCase() === 'n/a') return -1;
  let d = new Date(dateStr);
  const parts = dateStr.trim().split(/[-/ \s]+/);
  if (parts.length >= 3) {
    let day = parseInt(parts[0], 10);
    let monthStr = parts[1];
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    let month = parseInt(monthStr, 10) - 1; 
    if (isNaN(month)) {
      const months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
      month = months[monthStr.toLowerCase().substring(0,3)];
    }
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >= 0 && month <= 11) d = new Date(year, month, day);
  }
  if (isNaN(d.getTime())) return -1;
  const now = new Date(); now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const fetchNoticeData = async () => {
  try {
    const res = await fetch(NOTICE_SHEET_URL);
    if (!res.ok) return { message: '', buttons: [] };
    const text = await res.text();
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) return { message: '', buttons: [] };
    const rows = csvToArray(text);
    
    let message = '';
    const buttons = [];
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]) {
        // Find Message from Column A
        if (!message && rows[i][0]) {
          const val = String(rows[i][0]).trim();
          if (val && val.toUpperCase() !== 'MESSAGE') {
            message = val;
          }
        }
        // Extract Custom Buttons from Column B & C
        if (i > 0 && rows[i].length >= 2) {
          const btnName = String(rows[i][1] || '').trim();
          const btnUrl = String(rows[i][2] || '').trim();
          if (btnName && btnUrl && btnName.toUpperCase() !== 'BUTTON NAME') {
            buttons.push({ name: btnName, url: btnUrl });
          }
        }
      }
    }
    return { message, buttons };
  } catch(e) { return { message: '', buttons: [] }; }
};

const fetchInventoryData = async () => {
  try {
    const res = await fetch(INVENTORY_SHEET_URL);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) return [];
    const rows = csvToArray(text);
    const invList = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]; if (!row || row.length < 8) continue;
      const rawPCode = String(row[0] || '').trim().toUpperCase();
      const mName = String(row[1] || '').trim().toUpperCase().replace(/\s+/g, '');
      const invColor = String(row[2] || '').trim();
      const imei = String(row[3] || '').trim();
      const date = String(row[4] || '').trim();
      const dp = String(row[5] || '').trim();
      const mop = String(row[6] || '').trim();
      const available = String(row[7] || '').trim().toUpperCase();
      if (!available || available === '0' || available === 'NO' || available === 'FALSE' || available === 'SOLD') continue;
      let matchCode = rawPCode.replace(/\s+/g, '');
      if (matchCode.startsWith('SM-')) {
        const base5 = matchCode.substring(3, 8); let variant = '';
        if (matchCode.length >= 11) variant = matchCode.substring(10, 11); 
        matchCode = base5 + variant; 
      }
      invList.push({ pCode: rawPCode, matchCode, mName, invColor, imei, date, dp, mop, outlet: available });
    }
    return invList;
  } catch(e) { return []; }
};

const fetchColorStockData = async () => {
  try {
    const res = await fetch(COLOR_STOCK_SHEET_URL);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) return [];
    const rows = csvToArray(text);
    const colorList = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]; if (!row || row.length < 3) continue; 
      const rawPCode = String(row[0] || '').trim().toUpperCase();
      const color = String(row[2] || '').trim();
      const stockStatus = String(row[3] || '').trim().toUpperCase();
      if (!color || stockStatus === '0' || stockStatus === 'NO' || stockStatus === 'FALSE' || stockStatus === 'OUT OF STOCK') continue;
      let matchCode = rawPCode.replace(/\s+/g, '');
      if (matchCode.startsWith('SM-')) {
        const base5 = matchCode.substring(3, 8); let variant = '';
        if (matchCode.length >= 11) variant = matchCode.substring(10, 11); 
        matchCode = base5 + variant; 
      }
      colorList.push({ pCode: rawPCode, matchCode, color, stockStatus });
    }
    return colorList;
  } catch(e) { return []; }
};

const fetchImageDB = async () => {
  try {
    const res = await fetch(IMAGE_DB_URL); if (!res.ok) return {};
    const rows = csvToArray(await res.text()); const imgMap = {};
    rows.forEach(row => {
      if (row.length >= 2 && row[0] && row[1]) {
        const code = String(row[0]).trim().toUpperCase().replace(/\s+/g, '');
        let url = String(row[1]).trim();
        if (url.includes('drive.google.com/file/d/')) {
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (match) url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        } else if (url.includes('drive.google.com/open?id=')) {
          const match = url.match(/id=([a-zA-Z0-9_-]+)/); if (match) url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        if (url.startsWith('http') && code.length > 0) imgMap[code] = url;
      }
    });
    return imgMap;
  } catch (e) { return {}; }
};

const fetchSingleSheet = async ({ name, gid }) => {
  try {
    const res = await fetch(`${BASE_SHEET_URL}${gid}`);
    if (!res.ok) return { data: [], fetchedDate: null };
    const text = await res.text();
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) return { data: [], fetchedDate: null };
    const rows = csvToArray(text);
    if (!rows || rows.length === 0) return { data: [], fetchedDate: null };

    let fetchedDate = null;
    if (rows[0] && rows[0].length > 6) { const rawG1 = rows[0][6].trim(); if (rawG1 && rawG1 !== '') fetchedDate = rawG1; }

    let modelIdx = -1, giftIdx = -1, remarksIdx = -1, specialUpgradeIdx = -1, startIdx = 0;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const row = rows[i]; if (!row) continue;
      modelIdx = row.findIndex(c => c && c.trim().toUpperCase() === 'MODEL');
      if (modelIdx !== -1) {
        startIdx = i + 1;
        giftIdx = row.findIndex(c => c && c.trim().toUpperCase().includes('GIFT'));
        remarksIdx = row.findIndex(c => c && c.trim().toUpperCase().includes('REMARK'));
        specialUpgradeIdx = row.findIndex(c => c && c.trim().toUpperCase().includes('SPECIAL UPGRADE'));
        break;
      }
    }

    if (modelIdx === -1) return { data: [], fetchedDate };
    const parsedData = [];
    for (let i = startIdx; i < rows.length; i++) {
      const row = rows[i]; if (!row || row.length === 0) continue;
      const getVal = (idx) => (idx < 0 || idx >= row.length || !row[idx]) ? '0' : row[idx].trim();

      const rawModelName = getVal(modelIdx); const upperModelName = rawModelName.toUpperCase();
      if (!rawModelName || upperModelName.includes('MODEL') || rawModelName === '0' || rawModelName === 'NULL' || rawModelName === '') continue;

      const rawModelCode = getVal(0); const dpStr = getVal(modelIdx + 1); const mopStr = getVal(modelIdx + 2);
      const sellOutStr = getVal(modelIdx + 3); const upgradeStr = getVal(modelIdx + 4);
      const bankStr = getVal(modelIdx + 5); const effectiveStr = getVal(modelIdx + 6);

      const cleanVal = (val) => {
        const up = val.toUpperCase();
        return (up === '0' || up === 'NA' || up === '-' || up === 'NULL' || up === '') ? null : val;
      };

      const mopNum = parsePriceToNumber(mopStr); const effNum = parsePriceToNumber(effectiveStr);
      const finalModelCode = (rawModelCode && rawModelCode.length > 2 && rawModelCode.toUpperCase() !== 'MODEL CODE') ? rawModelCode : name;

      parsedData.push({
        id: `${gid}-${i}`, model: rawModelName, modelCode: finalModelCode, category: name,
        dp: dpStr !== '0' && dpStr !== 'NA' && dpStr !== '' ? dpStr : '-',
        mop: mopNum > 0 ? formatCurrency(mopNum) : (mopStr !== '0' && mopStr !== '' ? mopStr : 'TBA'),
        sellOut: sellOutStr !== '0' && sellOutStr !== 'NA' && sellOutStr !== '' ? sellOutStr : '-',
        upgrade: upgradeStr !== '0' && upgradeStr !== 'NA' && upgradeStr !== '' ? upgradeStr : '-',
        bank: bankStr !== '0' && bankStr !== 'NA' && bankStr !== '' ? bankStr : 'No Cashback',
        effectivePrice: effNum > 0 ? formatCurrency(effNum) : (effectiveStr !== '0' && effectiveStr !== '' ? effectiveStr : 'TBA'),
        mopNum, effNum, gift: cleanVal(getVal(giftIdx)), remarks: cleanVal(getVal(remarksIdx)), specialUpgrade: cleanVal(getVal(specialUpgradeIdx)),
        imageUrl: null, inventory: [], availableColors: []
      });
    }
    return { data: parsedData, fetchedDate };
  } catch (e) { return { data: [], fetchedDate: null }; }
};

// =========================================================================
// 3 DISTINCT POSTER GENERATORS (Cropped 15%, No Overlaps, Powered by Mab Arena)
// Includes the new "Vibrant Glass" design inspired by user upload
// =========================================================================
const generatePosterImage = async (phone, templateId, storeName) => {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920; const ctx = canvas.getContext('2d');
  
  let imgObj = null;
  if (phone.imageUrl) {
    try { 
      imgObj = await new Promise((res, rej) => { 
        const img = new Image(); img.crossOrigin = "anonymous"; 
        img.onload = () => res(img); img.onerror = rej; img.src = phone.imageUrl; 
      }); 
    } catch (e) {}
  }

  // --- Helpers ---
  const drawRoundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r); ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath();
  };

  // Smart wrap function that returns the next Y position to avoid overlap
  const drawDynamicOfferRow = (ctx, label, val, subtext, y, leftX, rightX, maxSubW, colorLabel, colorVal, colorSub) => {
    // Draw Label (Left)
    ctx.fillStyle = colorLabel; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label, leftX, y);
    
    // Draw Value (Right)
    ctx.fillStyle = colorVal; ctx.font = '900 36px sans-serif'; ctx.textAlign = 'right';
    let displayVal = val.includes('-') ? val : `- ${val}`;
    if(label === 'Special Offer:' && !val.includes('-')) displayVal = val;
    ctx.fillText(displayVal, rightX, y);
    
    let nextY = y + 10;
    
    // Draw Subtext with Wrap
    if (subtext) {
      ctx.fillStyle = colorSub; ctx.font = '22px sans-serif'; ctx.textAlign = 'right';
      const words = String(subtext).split(' '); let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (ctx.measureText(test).width > maxSubW && i > 0) {
          ctx.fillText(line.trim(), rightX, nextY + 25);
          line = words[i] + ' '; nextY += 30;
        } else { line = test; }
      }
      if(line.trim()) { ctx.fillText(line.trim(), rightX, nextY + 25); nextY += 30; }
    }
    return nextY + 45; // 45px padding for next row
  };

  // --- Prep Data ---
  const sn = splitModelName(phone.model);
  const sText = storeName ? storeName.toUpperCase() : 'SAMSUNG EXPERIENCE STORE';
  
  // Add GALAXY to model name if not present
  let displayModelName = sn.main.toUpperCase();
  if (!displayModelName.includes('GALAXY')) {
    displayModelName = 'GALAXY ' + displayModelName;
  }

  // --- Poster Specific Effective Price Calculation ---
  const sOutVal = parsePriceToNumber(splitAmountAndDesc(phone.sellOut).amount);
  const upgVal = parsePriceToNumber(splitAmountAndDesc(phone.upgrade).amount);
  const bankVal = parsePriceToNumber(splitAmountAndDesc(phone.bank).amount);
  const spclVal = parsePriceToNumber(splitAmountAndDesc(phone.specialUpgrade).amount);
  const isCombo = isComboOffer(phone.specialUpgrade);

  // Take the max of Upgrade and Bank (unless it's a combo offer)
  let maxUpgBank = isCombo ? (upgVal + bankVal) : Math.max(upgVal, bankVal);
  let posterEffNum = phone.mopNum - sOutVal - spclVal - maxUpgBank;

  // Set poster Effective Price
  let posterEffectivePrice = phone.effectivePrice;
  if (posterEffNum > 0 && phone.mopNum > 0) {
      posterEffectivePrice = formatCurrency(posterEffNum);
  }

  // Theme Definitions
  const themes = {
    'midnight-card': {
      bgMain: '#1e2133', bgCard: '#ffffff', textMain: '#0f172a', textSub: '#64748b', 
      boxBg: '#0f172a', boxText: '#ffffff', headerMain: '#ffffff', headerSub: '#94a3b8',
      divider: '#e2e8f0', gradientBg: true, gradientColors: ['#16192b', '#0b0c16'],
      colors: { sellout: '#059669', upgrade: '#a21caf', bank: '#2563eb', special: '#d97706' }
    },
    'dark-glass': {
      bgMain: '#000000', bgCard: 'rgba(24, 24, 27, 0.8)', textMain: '#ffffff', textSub: '#a1a1aa', 
      boxBg: '#ffffff', boxText: '#18181b', headerMain: '#ffffff', headerSub: '#a1a1aa',
      divider: '#27272a', gradientBg: false,
      colors: { sellout: '#34d399', upgrade: '#c084fc', bank: '#38bdf8', special: '#fbbf24' }
    },
    'vibrant-glass': {
      bgMain: '#c026d3', bgCard: 'rgba(255, 255, 255, 0.95)', textMain: '#0f172a', textSub: '#64748b', 
      boxBg: '#0f172a', boxText: '#ffffff', headerMain: '#ffffff', headerSub: 'rgba(255, 255, 255, 0.8)',
      divider: '#e2e8f0', gradientBg: false, // We will manually draw the mesh
      colors: { sellout: '#059669', upgrade: '#7c3aed', bank: '#0284c7', special: '#ea580c' }
    }
  };

  const t = themes[templateId] || themes['midnight-card'];

  // 1. Draw Outer Background
  if (templateId === 'vibrant-glass') {
    // Solid base
    ctx.fillStyle = '#9333ea'; ctx.fillRect(0,0,1080,1920); // Purple base
    
    // Draw Orbs for Mesh Effect
    const drawOrb = (x, y, r, color) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI);
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fill();
    };
    drawOrb(100, 200, 800, '#f97316'); // Orange Top-Left
    drawOrb(900, 1700, 1000, '#0ea5e9'); // Cyan Bottom-Right
    drawOrb(1080, 200, 700, '#c026d3'); // Fuchsia Top-Right
  } else if (t.gradientBg) {
    const grd = ctx.createLinearGradient(0,0,0,1920);
    grd.addColorStop(0, t.gradientColors[0]); grd.addColorStop(1, t.gradientColors[1]);
    ctx.fillStyle = grd; ctx.fillRect(0,0,1080,1920);
  } else {
    ctx.fillStyle = t.bgMain; ctx.fillRect(0,0,1080,1920);
    if (templateId === 'dark-glass') {
      ctx.beginPath(); ctx.arc(540, 500, 500, 0, 2*Math.PI);
      const glow = ctx.createRadialGradient(540, 500, 0, 540, 500, 500);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.fill();
    }
  }

  // 2. Top Header
  ctx.fillStyle = t.headerMain; ctx.font = '900 65px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EXCLUSIVE DEAL', 540, 100);
  ctx.fillStyle = t.headerSub; ctx.font = 'bold 28px sans-serif'; ctx.fillText('GRAB IT BEFORE IT\'S GONE', 540, 150);

  // 3. Main Card (Centered)
  const cardX = 80, cardY = 200, cardW = 920, cardH = 1460;
  
  if (templateId === 'dark-glass') {
    ctx.fillStyle = t.bgCard; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 50); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 50); ctx.stroke();
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
    ctx.fillStyle = t.bgCard; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 40); ctx.fill(); ctx.shadowColor = 'transparent';
  }

  // 4. Image (Cropped 15% Left & Right)
  let currentY = cardY + 50;
  if (imgObj) {
    const sX = imgObj.width * 0.15; // Crop 15% from left
    const sY = 0;
    const sW = imgObj.width * 0.70; // Keep middle 70%
    const sH = imgObj.height;

    const maxImgW = cardW * 0.65; const maxImgH = 420;
    const ratio = Math.min(maxImgW/sW, maxImgH/sH);
    const drawW = sW * ratio, drawH = sH * ratio;
    
    ctx.drawImage(imgObj, sX, sY, sW, sH, 540 - (drawW/2), currentY + (maxImgH - drawH)/2, drawW, drawH);
    currentY += maxImgH + 40;
  } else { currentY += 420 + 40; }

  // 5. Product Title
  ctx.fillStyle = t.textMain; ctx.font = '900 60px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(displayModelName, 540, currentY); currentY += 45;
  
  if (sn.sub) {
    ctx.fillStyle = (templateId === 'vibrant-glass') ? '#dc2626' : t.textSub; // Make subtext pop in vibrant
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(sn.sub.toUpperCase(), 540, currentY); currentY += 60;
  } else currentY += 40;

  // Divider Line
  ctx.strokeStyle = t.divider; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cardX + 50, currentY); ctx.lineTo(cardX + cardW - 50, currentY); ctx.stroke();
  currentY += 60;

  // 6. Dynamic Offers Table (No Overlap)
  const tLeft = cardX + 60, tRight = cardX + cardW - 60, maxW = cardW * 0.55;
  
  currentY = drawDynamicOfferRow(ctx, 'MOP Price:', phone.mop, null, currentY, tLeft, tRight, maxW, t.textSub, t.textMain, t.textSub);
  
  if(isValidDiscount(phone.sellOut)) {
    const p = splitAmountAndDesc(phone.sellOut);
    currentY = drawDynamicOfferRow(ctx, 'Sellout Support:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.sellout, t.textSub);
  }
  
  const hasUpg = isValidDiscount(phone.upgrade);
  const hasBank = isValidDiscount(phone.bank);

  if(hasUpg) {
    const p = splitAmountAndDesc(phone.upgrade);
    currentY = drawDynamicOfferRow(ctx, 'Upgrade Bonus:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.upgrade, t.textSub);
  }

  if (hasUpg && hasBank && !isCombo) {
    ctx.fillStyle = t.divider; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('━━━ OR ━━━', 540, currentY); currentY += 45;
  }

  if(hasBank) {
    const p = splitAmountAndDesc(phone.bank);
    currentY = drawDynamicOfferRow(ctx, 'Bank Offer:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.bank, t.textSub);
  }

  if(isValidDiscount(phone.specialUpgrade)) {
    const p = splitAmountAndDesc(phone.specialUpgrade);
    currentY = drawDynamicOfferRow(ctx, 'Special Offer:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.special, t.textSub);
  }

  // 7. Effective Price Box (Anchored at Bottom of Card)
  const boxH = 180; const boxY = cardY + cardH - boxH - 40; 
  ctx.fillStyle = t.boxBg; drawRoundRect(ctx, cardX + 40, boxY, cardW - 80, boxH, 24); ctx.fill();
  
  ctx.fillStyle = (templateId === 'dark-glass') ? '#71717a' : '#94a3b8'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('EFFECTIVE PRICE', 540, boxY + 60);
  ctx.fillStyle = t.boxText; ctx.font = '900 85px sans-serif';
  ctx.fillText(posterEffectivePrice, 540, boxY + 140);

  // 8. Footer (Outside Card)
  ctx.fillStyle = t.headerSub; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Visit at', 540, cardY + cardH + 70);
  ctx.fillStyle = t.headerMain; ctx.font = '900 45px sans-serif';
  ctx.fillText(sText, 540, cardY + cardH + 120);
  ctx.fillStyle = t.headerSub; ctx.font = '22px sans-serif';
  ctx.fillText('Developed by Mab Arena', 540, cardY + cardH + 170);

  const link = document.createElement('a'); link.download = `Offer_${sn.main.replace(/\s+/g,'_')}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.95); link.click();
};

const PosterTemplateModal = memo(({ phone, onGenerate, onClose }) => {
  if (!phone) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-[420px] overflow-hidden shadow-2xl relative animate-fade-in-up">
        <div className="p-5 text-center border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-[16px] font-black text-slate-900 pl-2">Select Design Theme</h3>
          <button onClick={onClose} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"><X size={16} /></button>
        </div>
        
        <div className="p-5 grid grid-cols-3 gap-3 bg-white">
          
          {/* Midnight Card */}
          <button onClick={() => onGenerate(phone, 'midnight-card')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[16px] bg-[#16192b] border border-slate-200 group-hover:border-indigo-500 group-hover:shadow-lg transition-all flex flex-col items-center justify-center p-2 relative">
               <div className="w-full h-full bg-white rounded-xl shadow-sm flex flex-col items-center p-2">
                 <div className="w-8 h-8 bg-slate-100 rounded-full mb-1"></div>
                 <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-1 mt-auto"></div>
                 <div className="w-full h-5 bg-slate-900 rounded-md"></div>
               </div>
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Midnight Card</span>
          </button>

          {/* Dark Glass */}
          <button onClick={() => onGenerate(phone, 'dark-glass')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[16px] bg-black border border-slate-200 group-hover:border-indigo-500 group-hover:shadow-lg transition-all flex flex-col items-center justify-center p-2 relative overflow-hidden">
               <div className="absolute top-4 w-12 h-12 bg-cyan-500/30 blur-md rounded-full"></div>
               <div className="absolute bottom-2 w-[90%] h-[55%] bg-zinc-800/80 rounded-xl border border-zinc-700 flex flex-col justify-end p-2">
                 <div className="w-full h-4 bg-white rounded-sm"></div>
               </div>
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Dark Glass</span>
          </button>

          {/* Vibrant Glass (New) */}
          <button onClick={() => onGenerate(phone, 'vibrant-glass')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[16px] bg-gradient-to-br from-orange-400 via-purple-500 to-cyan-500 border border-slate-200 group-hover:border-indigo-500 group-hover:shadow-lg transition-all flex flex-col items-center justify-center p-2 relative overflow-hidden">
               <div className="w-full h-full bg-white/90 rounded-xl shadow-sm flex flex-col items-center p-2">
                 <div className="w-8 h-8 bg-slate-100 rounded-full mb-1"></div>
                 <div className="w-12 h-1.5 bg-slate-400 rounded-full mb-1 mt-auto"></div>
                 <div className="w-full h-5 bg-slate-900 rounded-md"></div>
               </div>
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Vibrant Glass</span>
          </button>

        </div>
      </div>
    </div>
  );
});
// =========================================================================

const InstallPrompt = ({ onContinue }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showFallbackMsg, setShowFallbackMsg] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onContinue();
      }
    } else {
      setShowFallbackMsg(true);
      setTimeout(() => setShowFallbackMsg(false), 5000);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative overflow-hidden selection:bg-indigo-100">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-100/80 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-100/60 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-[400px] mx-auto">
        <div className="w-full animate-fade-in-up flex flex-col items-center">
          
          <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center mb-4 shadow-xl shadow-slate-900/20">
             <IndianRupee size={32} className="text-white" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-[26px] font-black tracking-tight text-slate-900 leading-tight mb-1 text-center">
            SamAssist <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pro</span>
          </h1>
          <p className="text-slate-500 text-[12px] font-medium text-center px-2 mb-6 leading-relaxed">
            Install the app for lightning-fast access, offline support, and a seamless native feel.
          </p>

          <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-[16px] shadow-sm border border-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Zap size={16} /></div>
              <div className="flex flex-col"><span className="font-bold text-[12px] text-slate-900 leading-tight">Instant</span><span className="text-[10px] text-slate-500 leading-tight mt-0.5">Zero wait time</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-[16px] shadow-sm border border-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><WifiOff size={16} /></div>
              <div className="flex flex-col"><span className="font-bold text-[12px] text-slate-900 leading-tight">Offline</span><span className="text-[10px] text-slate-500 leading-tight mt-0.5">Works anywhere</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-[16px] shadow-sm border border-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Maximize size={16} /></div>
              <div className="flex flex-col"><span className="font-bold text-[12px] text-slate-900 leading-tight">Immersive</span><span className="text-[10px] text-slate-500 leading-tight mt-0.5">Full screen</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-[16px] shadow-sm border border-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Home size={16} /></div>
              <div className="flex flex-col"><span className="font-bold text-[12px] text-slate-900 leading-tight">1-Tap</span><span className="text-[10px] text-slate-500 leading-tight mt-0.5">Home access</span></div>
            </div>
          </div>

          <a href="https://youtube.com/@MabArena" target="_blank" rel="noopener noreferrer" className="bg-red-50 hover:bg-red-100 border border-red-100 transition-colors rounded-[16px] p-3 w-full flex items-center justify-center gap-2 shadow-sm">
            <Youtube size={18} className="text-red-500" />
            <span className="text-[13px] font-bold text-slate-800">Developed by <span className="text-red-600 font-black">Mab Arena</span></span>
          </a>

          {showFallbackMsg && (
            <div className="mt-3 w-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium p-2.5 rounded-[12px] animate-fade-in flex items-start gap-2 text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <p>Tap menu (⋮) & select <b className="text-amber-900">"Add to Home screen"</b>.</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 z-20 w-full max-w-[400px] mx-auto mt-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <button onClick={handleInstallClick} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-[18px] flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-slate-900/20 mb-2.5">
          <Download size={18} /> Install Application
        </button>
        <button onClick={onContinue} className="w-full text-slate-500 hover:text-slate-700 font-bold py-2.5 text-[13px] flex items-center justify-center gap-2 transition-all">
          Skip & Continue to Login
        </button>
      </div>
    </div>
  );
};

const SecurityLogin = ({ onLoginSuccess }) => {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isOffline) {
      setError("Internet connection is required to login.");
      return;
    }
    
    const cleanMobile = mobile.replace(/\D/g, ''); 
    
    if (cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (pin.trim().length < 4) {
      setError("Please enter your secret PIN (minimum 4 digits)");
      return;
    }

    const inputLast10 = cleanMobile.slice(-10);
    const inputPin = pin.trim();

    setLoading(true);
    setError('');
    setShowRequestBtn(false);

    try {
      const res = await fetch(AUTH_SHEET_URL);
      if (!res.ok) throw new Error("Failed to connect to auth server");
      const csvText = await res.text();
      
      if (csvText.includes('<!doctype html>')) {
        throw new Error("Invalid Auth Sheet GID. Check if sheet is published/public.");
      }

      const rows = csvToArray(csvText);
      let isAuthorized = false;
      let userName = "User";
      let hasNlcAccess = false;
      let hasDpAccess = false;
      let hasStockAccess = false;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2) {
          const col0 = String(row[0] || "").trim();
          const col1 = String(row[1] || "").trim();
          const col2 = String(row[2] || "").trim();
          const col3 = String(row[3] || "").trim().toUpperCase();
          const col4 = String(row[4] || "").trim().toUpperCase();
          const col5 = String(row[5] || "").trim().toUpperCase();

          const mobileFromCol0 = col0.replace(/\D/g, '').slice(-10);
          const mobileFromCol1 = col1.replace(/\D/g, '').slice(-10);

          if (mobileFromCol0 === inputLast10 && inputLast10.length === 10 && col2 === inputPin) {
            isAuthorized = true;
            userName = col1 || "Dealer";
            hasNlcAccess = (col3 === "YES");
            hasDpAccess = (col4 === "YES");
            hasStockAccess = (col5 === "YES");
            break;
          } else if (mobileFromCol1 === inputLast10 && inputLast10.length === 10 && col2 === inputPin) {
            isAuthorized = true;
            userName = col0 || "Dealer";
            hasNlcAccess = (col3 === "YES");
            hasDpAccess = (col4 === "YES");
            hasStockAccess = (col5 === "YES");
            break;
          }
        }
      }

      if (isAuthorized) {
        localStorage.setItem('samsung_dealer_auth', inputLast10);
        localStorage.setItem('samsung_dealer_name', userName);
        localStorage.setItem('samsung_dealer_nlc_access', hasNlcAccess ? 'YES' : 'NO');
        localStorage.setItem('samsung_dealer_dp_access', hasDpAccess ? 'YES' : 'NO');
        localStorage.setItem('samsung_dealer_stock_access', hasStockAccess ? 'YES' : 'NO');
        onLoginSuccess(userName, hasNlcAccess, hasDpAccess, hasStockAccess);
      } else {
        setError("Access Denied! Incorrect Mobile Number or PIN.");
        setShowRequestBtn(true);
      }

    } catch (err) {
      setError(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = () => {
    const message = `Hello Admin, I would like to request access for SamAssist Pro.\nMy Mobile Number is: ${mobile}\nPlease provide me the secret PIN.`;
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden selection:bg-indigo-100">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-100/60 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-6 z-10 w-full max-w-[440px] mx-auto">
        <div className="w-full bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] animate-fade-in-up">
          
          <div className="mb-10 flex flex-col items-start">
            <div className="w-14 h-14 bg-slate-900 rounded-[18px] flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
               <IndianRupee size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-[14px] font-medium mt-1">
              Sign in to your authorized account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-slate-900 text-[13px] font-bold mb-2 block ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Enter 10-digit number" 
                  value={mobile}
                  onChange={(e) => { setMobile(e.target.value); setError(''); setShowRequestBtn(false); }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-[20px] py-4 pl-12 pr-4 text-[16px] font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                  maxLength="15"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2 ml-1 mr-1">
                 <label className="text-slate-900 text-[13px] font-bold block">Secret PIN</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type={showPin ? "text" : "password"} 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••" 
                  value={pin}
                  onChange={(e) => { 
                    setPin(e.target.value.replace(/\D/g, '')); 
                    setError(''); 
                    setShowRequestBtn(false); 
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-[20px] py-4 pl-12 pr-12 text-[18px] tracking-widest font-black placeholder-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                  maxLength="8"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-[20px] flex items-start gap-3 animate-fade-in">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-[13px] font-semibold leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || mobile.replace(/\D/g, '').length < 10 || pin.trim().length < 4 || isOffline}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:hover:bg-slate-900 text-white font-bold py-4 rounded-[20px] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2.5 mt-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : (isOffline ? <WifiOff size={20} /> : <LogIn size={20} />)}
              {loading ? 'Verifying...' : (isOffline ? 'Offline - Check Connection' : 'Sign In')}
            </button>

            {showRequestBtn && (
              <button 
                type="button"
                onClick={handleRequestAccess}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-4 rounded-[20px] transition-all flex items-center justify-center gap-2.5 mt-4 animate-fade-in border border-emerald-100"
              >
                <MessageCircle size={20} className="text-emerald-500" />
                Request Access
              </button>
            )}
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            <ShieldAlert size={14} /> Secured Area
          </div>
        </div>
      </div>
    </div>
  );
};

const PhoneCard = memo(({ phone, isExpanded, isSelectedForCompare, onToggleExpand, onToggleCompare, onCopy, copyStatus, onWhatsApp, onGenerateImage, isGenerating, onOpenCalc, onOpenInventory, hasNlcAccess, hasDpAccess, hasStockAccess }) => {
  const hasBank = isValidDiscount(phone.bank); 
  const hasUpg = isValidDiscount(phone.upgrade);
  const hasSellOut = isValidDiscount(phone.sellOut); 
  const hasSpcl = isValidDiscount(phone.specialUpgrade);
  const isCombo = isComboOffer(phone.specialUpgrade);

  const sellOutDetails = splitAmountAndDesc(phone.sellOut);
  const upgradeDetails = splitAmountAndDesc(phone.upgrade);
  const bankDetails = splitAmountAndDesc(phone.bank);
  const specialDetails = splitAmountAndDesc(phone.specialUpgrade);

  const parsedName = useMemo(() => splitModelName(phone.model), [phone.model]);

  const totalColorStock = useMemo(() => {
    if (!phone.availableColors) return 0;
    return phone.availableColors.reduce((sum, item) => sum + item.qty, 0);
  }, [phone.availableColors]);

  const currentDpNum = useMemo(() => parsePriceToNumber(phone.dp), [phone.dp]);
  const cheaperStock = useMemo(() => {
    if (!phone.inventory || phone.inventory.length === 0 || currentDpNum === 0 || !hasDpAccess) return [];
    return phone.inventory.filter(item => {
      const oldDpNum = parsePriceToNumber(item.dp);
      return oldDpNum > 0 && oldDpNum < currentDpNum;
    });
  }, [phone.inventory, currentDpNum, hasDpAccess]);

  const hasCheaperStock = cheaperStock.length > 0;

  return (
    <div className={`bg-white rounded-[20px] transition-all duration-200 relative ${isExpanded ? 'shadow-md border border-slate-200 z-10' : 'shadow-sm border border-slate-100 hover:border-slate-200'}`}>
      
      {isCombo && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-bl-xl rounded-tr-[19px] z-10 shadow-sm">
          Combo Offer
        </div>
      )}

      <div onClick={() => onToggleExpand(phone.id)} className="flex justify-between items-center p-3.5 sm:p-4 cursor-pointer pt-4">
        <div className="flex items-center gap-3.5 w-[72%] pr-2">
          
          <div className="relative w-14 h-14 shrink-0">
            <div className="w-full h-full rounded-xl bg-white border border-slate-100 p-1 shadow-sm overflow-hidden flex items-center justify-center">
              {phone.imageUrl ? (
                <img src={phone.imageUrl} alt="" loading="lazy" className="w-full h-full object-contain scale-110" />
              ) : (
                <CustomSamsungIcon className="text-slate-300" size={26} />
              )}
            </div>
            {hasStockAccess && totalColorStock > 0 && !isExpanded && (
              <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border border-white shadow-sm z-10">
                 {totalColorStock}
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-w-0 justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 leading-none mb-1.5">
              {phone.modelCode}
            </span>
            <h3 className="text-[15px] font-black text-slate-900 leading-tight break-words">
              {parsedName.main}
            </h3>
            {parsedName.sub && (
              <span className="text-[11px] font-bold text-slate-500 leading-tight mt-0.5 break-words">
                {parsedName.sub}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">MOP</p>
            <p className="text-[16px] font-black text-slate-900 leading-none tracking-tight">{phone.mop}</p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400 border border-slate-200 rotate-0'}`}>
            <ChevronDown size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3.5 sm:px-4 pb-4 pt-0 animate-fade-in origin-top">
          
          {(hasStockAccess && (hasCheaperStock || (phone.availableColors && phone.availableColors.length > 0))) && (
            <div className="flex items-center justify-between gap-2 mb-3.5 bg-slate-50/80 rounded-xl p-1.5 border border-slate-100 shadow-sm overflow-hidden">
              
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1 pl-0.5">
                {phone.availableColors && phone.availableColors.length > 0 ? (
                  phone.availableColors.map((item, idx) => (
                    <div key={idx} className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 pl-1.5 pr-1 py-1 rounded-md shadow-sm">
                      <span className="truncate max-w-[70px]">{item.color}</span>
                      <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-[9px]">{item.qty}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 italic px-2">Color data unavailable</span>
                )}
              </div>

              {hasCheaperStock && (
                <div className="shrink-0 pl-1.5 border-l border-slate-200">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onOpenInventory(phone); }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1.5 rounded-lg shadow-sm flex items-center gap-1 hover:shadow-md transition-all relative"
                  >
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-50 border border-white"></span>
                    </span>
                    <ArrowDown size={12} strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Lower DP</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-3.5">
            <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-slate-200">
              <span className="text-[12px] font-semibold text-slate-500">Live Dealer Price (DP)</span>
              {hasDpAccess ? (
                <span className="text-[13px] font-bold text-slate-900">{phone.dp}</span>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-slate-200">
                  <Lock size={12} className="mb-[1px]" /> Restricted
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {hasSellOut && (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Tag size={14} className="text-emerald-500" /><span className="text-[12px] font-medium text-slate-600">Sellout</span></div>
                    <span className="text-[12px] font-bold text-emerald-600">- {formatSafePrice(sellOutDetails.amount)}</span>
                  </div>
                  {sellOutDetails.desc && <div className="text-[10px] text-slate-400 text-right mt-0.5 leading-tight">{sellOutDetails.desc}</div>}
                </div>
              )}
              
              {hasUpg && (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><TrendingUp size={14} className="text-purple-500" /><span className="text-[12px] font-medium text-slate-600">Upgrade</span></div>
                    <span className="text-[12px] font-bold text-purple-600">- {formatSafePrice(upgradeDetails.amount)}</span>
                  </div>
                  {upgradeDetails.desc && <div className="text-[10px] text-slate-400 text-right mt-0.5 leading-tight">{upgradeDetails.desc}</div>}
                </div>
              )}

              {hasUpg && hasBank && !isCombo && (
                <div className="flex items-center justify-center py-0.5 opacity-40">
                  <div className="h-px bg-slate-400 w-8"></div>
                  <span className="mx-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-slate-400 w-8"></div>
                </div>
              )}
              
              {hasBank && (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><CreditCard size={14} className="text-blue-500" /><span className="text-[12px] font-medium text-slate-600">Bank Offer</span></div>
                    <span className="text-[12px] font-bold text-blue-600">- {formatSafePrice(bankDetails.amount)}</span>
                  </div>
                  {bankDetails.desc && <div className="text-[10px] text-slate-400 text-right mt-0.5 leading-tight">{bankDetails.desc}</div>}
                </div>
              )}

              {hasSpcl && (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Zap size={14} className="text-amber-500 fill-amber-500" /><span className="text-[12px] font-medium text-slate-600">Special</span></div>
                    <span className="text-[12px] font-bold text-amber-600">{formatSafePrice(specialDetails.amount)}</span>
                  </div>
                  {specialDetails.desc && <div className="text-[10px] text-slate-400 text-right mt-0.5 leading-tight">{specialDetails.desc}</div>}
                </div>
              )}
              {(!hasSellOut && !hasUpg && !hasBank && !hasSpcl) && (
                <div className="text-center text-[11px] text-slate-400 py-1">No additional offers available</div>
              )}
            </div>
          </div>

          {(phone.gift || phone.remarks) && (
            <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-3.5 mb-3.5 space-y-2.5">
              {phone.gift && (
                <div className="flex items-start gap-2.5">
                  <Gift size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Customer Gift</span>
                    <span className="text-[12px] font-bold text-amber-900 leading-tight">{phone.gift}</span>
                  </div>
                </div>
              )}
              {phone.remarks && (
                <div className={`flex items-start gap-2.5 ${phone.gift ? 'pt-2.5 border-t border-amber-200/50' : ''}`}>
                  <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Remarks / Note</span>
                    <span className="text-[12px] font-bold text-blue-900 leading-tight">{phone.remarks}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl py-3 px-4 text-center shadow-md relative overflow-hidden mb-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 mb-0.5 relative z-10">Live Effective Price</p>
            <p className="text-[20px] sm:text-[22px] font-black tracking-tight text-white relative z-10 drop-shadow-sm">{phone.effectivePrice}</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button onClick={(e) => { e.stopPropagation(); onCopy(phone); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
              {copyStatus === phone.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
              {copyStatus === phone.id ? 'Copied' : 'Copy'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onGenerateImage(phone); }} disabled={isGenerating === phone.id} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-100 disabled:opacity-50">
              {isGenerating === phone.id ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
              Poster
            </button>
            <button onClick={(e) => { e.stopPropagation(); onWhatsApp(phone); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] font-bold text-[10px] border border-[#BBF7D0]">
              <MessageCircle size={16} className="text-[#22C55E]" />
              Share
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleCompare(phone); }} className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all font-bold text-[10px] border ${isSelectedForCompare ? 'bg-orange-500 border-orange-500 text-white shadow-inner' : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'}`}>
              <Layers size={16}/>
              {isSelectedForCompare ? 'Added' : 'Compare'}
            </button>
          </div>
          
          {hasNlcAccess ? (
            <button onClick={(e) => { e.stopPropagation(); onOpenCalc(phone); }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm">
              <Calculator size={16} /> Open Smart Calculator
            </button>
          ) : (
            <div className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 border border-slate-200">
              <Lock size={14} /> Calculator Restricted
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const InventoryModal = memo(({ phone, onClose }) => {
  const parsedName = useMemo(() => {
    if (!phone) return { main: '', sub: '' };
    return splitModelName(phone.model);
  }, [phone]);

  const currentDpNum = useMemo(() => {
    if (!phone) return 0;
    return parsePriceToNumber(phone.dp);
  }, [phone]);

  const sortedInventory = useMemo(() => {
    if (!phone || !phone.inventory) return [];
    return [...phone.inventory].map(item => {
      return { ...item, age: calculateStockAge(item.date) };
    }).sort((a, b) => b.age - a.age);
  }, [phone]);

  if (!phone) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in p-4 font-sans">
      <div className="bg-[#F8FAFC] w-full max-w-[450px] max-h-[85vh] rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden animate-fade-in-up border border-slate-200/50">
        
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex justify-between items-center z-30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
              <PackageOpen size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[16px] font-black text-slate-900 leading-none">Shop Stock Info</h1>
              <span className="text-[11px] font-bold text-slate-500 mt-0.5">{parsedName.main}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white px-5 py-3 border-b border-slate-100 shrink-0 flex justify-between items-center shadow-sm z-20">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Current Live DP</span>
          <span className="text-[16px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{phone.dp}</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto hide-scrollbar space-y-3">
          {sortedInventory.map((item, idx) => {
            const oldDpNum = parsePriceToNumber(item.dp);
            const isCheaper = oldDpNum > 0 && oldDpNum < currentDpNum;
            const diff = currentDpNum - oldDpNum;

            return (
              <div key={idx} className={`rounded-xl p-4 border shadow-sm relative overflow-hidden ${isCheaper ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-white border-slate-200'}`}>
                {isCheaper && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-bl-xl z-10 flex items-center gap-1 shadow-sm">
                    <ArrowDown size={10} strokeWidth={3}/> Cheaper
                  </div>
                )}
                
                <div className="mb-3 pr-16">
                  <span className="text-[14px] font-black text-slate-800 leading-tight block mb-1">
                    {item.mName || 'Unknown Model'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block">
                      {item.pCode || 'N/A'} {item.matchedColor ? ` • ${item.matchedColor}` : ''}
                    </span>
                    {item.outlet && item.outlet !== 'YES' && item.outlet !== 'TRUE' && (
                      <span className="text-[9px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-sm">
                        📍 {item.outlet}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start mb-3 border-b border-slate-100/80 pb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">IMEI / Serial No</span>
                    <span className="text-[13px] font-bold text-slate-700">{item.imei || 'Not Available'}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tertiary Date</span>
                     <div className="flex items-center gap-1.5 mt-0.5">
                       {item.age >= 0 && (
                         <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${item.age > 60 ? 'bg-red-100 text-red-600' : item.age > 30 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                           {item.age} Days
                         </span>
                       )}
                       <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-100 shadow-sm px-2 py-1 rounded-md">{item.date || 'N/A'}</span>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Old MOP</span>
                      <span className="text-[13px] font-bold text-slate-600">{formatSafePrice(item.mop)}</span>
                   </div>
                   <div className="flex flex-col items-end text-right gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Old Purchased DP</span>
                      <div className="flex items-center gap-2">
                        {isCheaper && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md shadow-sm">
                            Save ₹{diff.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className={`text-[17px] font-black select-all cursor-text ${isCheaper ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {formatSafePrice(item.dp)}
                        </span>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const NlcCalculator = memo(({ onClose, initialData, showToast }) => {
  const [inputValue, setInputValue] = useState('');
  const [specialSupport, setSpecialSupport] = useState('');
  const [upgradeCb, setUpgradeCb] = useState('');
  const [series, setSeries] = useState('S'); 
  const [baseType, setBaseType] = useState('DP'); 
  const [schemePercent, setSchemePercent] = useState(6.5);
  const [kroPercent, setKroPercent] = useState(1.5);
  const [flatFit3Amount, setFlatFit3Amount] = useState(0); 
  const [copied, setCopied] = useState(false);
  const [cbPromptAmount, setCbPromptAmount] = useState(null);
  const [marginAmount, setMarginAmount] = useState('');

  const parsedModelName = useMemo(() => {
      if (!initialData || !initialData.model) return { main: 'Model', sub: '' };
      return splitModelName(initialData.model);
  }, [initialData]);

  useEffect(() => {
    if (initialData && initialData.model) {
      const categoryStr = (initialData.category || '').toUpperCase();
      const modelStr = (initialData.model || '').toUpperCase();
      const isASeries = categoryStr.includes('A SERIES') || categoryStr.includes('M & F');
      setSeries(isASeries ? 'A' : 'S');

      const dpNum = parsePriceToNumber(initialData.dp);
      const mopNum = parsePriceToNumber(initialData.mop);
      let workingBase = 0;
      
      if (dpNum > 0) { setBaseType('DP'); setInputValue(dpNum.toString()); workingBase = dpNum; } 
      else if (mopNum > 0 && isASeries) { setBaseType('MOP'); setInputValue(mopNum.toString()); workingBase = mopNum / 1.04; } 
      else if (mopNum > 0) { setBaseType('DP'); setInputValue(mopNum.toString()); workingBase = mopNum; }

      const sellOutNum = parsePriceToNumber(splitAmountAndDesc(initialData.sellOut).amount);
      if (sellOutNum > 0) setSpecialSupport(sellOutNum.toString()); else setSpecialSupport('');

      const upgNum = parsePriceToNumber(splitAmountAndDesc(initialData.upgrade).amount);
      const spclUpNum = parsePriceToNumber(splitAmountAndDesc(initialData.specialUpgrade).amount);
      const bnkNum = parsePriceToNumber(splitAmountAndDesc(initialData.bank).amount);
      
      const isCombo = isComboOffer(initialData.specialUpgrade);
      if (isCombo) {
          const totalUpgBank = upgNum + spclUpNum + bnkNum;
          setUpgradeCb(totalUpgBank > 0 ? totalUpgBank.toString() : '');
          setCbPromptAmount(null);
      } else {
          const totalUpgrade = upgNum + spclUpNum;
          if (totalUpgrade > 0) {
              setUpgradeCb(totalUpgrade.toString());
              setCbPromptAmount(null);
          } else if (bnkNum > 0) {
              setCbPromptAmount(bnkNum);
              setUpgradeCb('');
          } else {
              setUpgradeCb('');
              setCbPromptAmount(null);
          }
      }

      let calculatedScheme = 6.5; 
      if (categoryStr.includes('GEAR BUD') || modelStr.includes('WATCH') || modelStr.includes('BUDS') || modelStr.includes('RING') || modelStr.includes('FIT')) {
          if (modelStr.includes('FIT 3')) { calculatedScheme = 0; setFlatFit3Amount(350); } 
          else if (modelStr.includes('BUDS')) calculatedScheme = 15.5;
          else if (modelStr.includes('WATCH') || modelStr.includes('RING')) calculatedScheme = 9.5;
      } else if (categoryStr.includes('M & F SERIES') || modelStr.match(/[MF]\d{2}/)) {
          if (modelStr.includes('M56') || modelStr.includes('F56') || modelStr.includes('F17')) calculatedScheme = workingBase >= 20000 ? 6.5 : 5.5;
          else calculatedScheme = 2.0;
      } else { calculatedScheme = workingBase >= 20000 ? 6.5 : 5.5; }
      
      setSchemePercent(calculatedScheme);
    }
  }, [initialData]);

  // Crash-proof calculations
  const rawInput = Number(inputValue) || 0;
  const specialSupportValue = Number(specialSupport) || 0;
  const upgradeCbValue = Number(upgradeCb) || 0;
  
  const isMop = series === 'A' && baseType === 'MOP';
  const actualDp = isMop ? (rawInput / 1.04) : rawInput;
  
  const inbillMargin = Math.round(actualDp * 0.03) || 0;
  const purchaseRate = Math.round(actualDp - inbillMargin) || 0; 

  const monthlyBase = Math.max(0, actualDp - specialSupportValue) || 0; 
  const monthlyScheme = flatFit3Amount > 0 ? flatFit3Amount : (Math.round((monthlyBase / 1.18) * (schemePercent / 100)) || 0);
  const kroScheme = series === 'A' ? (Math.round((monthlyBase / 1.18) * (kroPercent / 100)) || 0) : 0;

  const nlcBeforeBank = Math.round(actualDp - inbillMargin - monthlyScheme - kroScheme - specialSupportValue) || 0;
  const finalNlc = Math.round(nlcBeforeBank - upgradeCbValue) || 0;
  
  const marginValue = Number(marginAmount) || 0;
  const finalCustomerPrice = (finalNlc + marginValue) || 0;

  const formatCurrencyCalc = (amount) => {
    const val = Number(amount);
    if (isNaN(val)) return '₹0';
    return '₹' + val.toLocaleString('en-IN');
  };

  const handleCopyBreakdown = () => {
    let copyText = `📱 *${parsedModelName.main} ${parsedModelName.sub}`.trim() + `*\n`;
    copyText += `🏷️ MOP : *${initialData.mop || 'TBA'}*\n\n`;
    
    copyText += `💰 Base (${baseType}) : *${formatCurrencyCalc(rawInput)}*\n`;
    
    if (specialSupportValue > 0) {
        const spclDesc = splitAmountAndDesc(initialData?.sellOut).desc;
        copyText += `🎁 Sellout : *-${formatCurrencyCalc(specialSupportValue)}* ${spclDesc ? `(${spclDesc})` : ''}\n`;
    }
    
    copyText += `➖ Inbill (3%) : *-${formatCurrencyCalc(inbillMargin)}*\n`;
    copyText += `📦 Purchase Rate : *${formatCurrencyCalc(purchaseRate)}*\n`;
    copyText += `➖ Scheme-5 (${flatFit3Amount > 0 ? 'Flat' : schemePercent + '%'}) : *-${formatCurrencyCalc(monthlyScheme)}*\n`;
    
    if (series === 'A' && kroPercent > 0) {
        copyText += `➖ Awesome Dhamaka (${kroPercent}%) : *-${formatCurrencyCalc(kroScheme)}*\n`;
    }
    
    copyText += `------------------------\n`;
    copyText += `📉 NLC : *${formatCurrencyCalc(nlcBeforeBank)}*\n`;
    
    if (upgradeCbValue > 0) {
        let label = "Upg / Bank";
        let extraNote = "";
        
        const bnkAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.bank).amount);
        const upgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.upgrade).amount);
        const spclUpgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.specialUpgrade).amount);
        
        if (upgradeCbValue === bnkAmt && bnkAmt > 0) {
            label = "Bank Cb";
            const desc = splitAmountAndDesc(initialData?.bank).desc;
            if (desc) extraNote = `\n   ↳ 💳 _${desc}_`;
        } else if (upgradeCbValue === (upgAmt + spclUpgAmt) && (upgAmt + spclUpgAmt) > 0) {
            label = "Upgrade Bonus";
            const desc1 = splitAmountAndDesc(initialData?.upgrade).desc;
            const desc2 = splitAmountAndDesc(initialData?.specialUpgrade).desc;
            const combinedDesc = [desc1, desc2].filter(Boolean).join(' | ');
            if (combinedDesc) extraNote = `\n   ↳ 🔄 _${combinedDesc}_`;
        } else {
            label = "Upg/Bank Offer";
            const desc1 = splitAmountAndDesc(initialData?.bank).desc;
            const desc2 = splitAmountAndDesc(initialData?.upgrade).desc;
            const combinedDesc = [desc1, desc2].filter(Boolean).join(' | ');
            if (combinedDesc) extraNote = `\n   ↳ ℹ️ _${combinedDesc}_`;
        }

        copyText += `🎁 ${label} : *-${formatCurrencyCalc(upgradeCbValue)}*${extraNote}\n`;
        copyText += `------------------------\n`;
    }
    
    if (marginValue > 0) {
        copyText += `➕ Margin : *${formatCurrencyCalc(marginValue)}*\n`;
        copyText += `------------------------\n`;
        copyText += `🔥 *FINAL QUOTE : ${formatCurrencyCalc(finalCustomerPrice)}*`;
    } else {
        copyText += `🔥 *FINAL NLC : ${formatCurrencyCalc(finalNlc)}*`;
    }

    const el = document.createElement("textarea"); 
    el.value = copyText; 
    el.style.position = 'fixed'; 
    el.style.opacity = '0';
    document.body.appendChild(el); 
    el.focus();
    el.select();
    try { 
      document.execCommand('copy'); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000); 
      if (showToast) showToast("Breakdown Copied!");
    } catch (err) {
      if (showToast) showToast("Failed to copy");
    } 
    document.body.removeChild(el);
  };

  const decreaseScheme = () => { if (schemePercent > 0.0) setSchemePercent(prev => parseFloat((prev - 0.5).toFixed(1))); };
  const increaseScheme = () => { if (schemePercent < 20.0) setSchemePercent(prev => parseFloat((prev + 0.5).toFixed(1))); };
  const decreaseKro = () => { if (kroPercent > 0.0) setKroPercent(prev => parseFloat((prev - 0.5).toFixed(1))); };
  const increaseKro = () => { if (kroPercent < 3.0) setKroPercent(prev => parseFloat((prev + 0.5).toFixed(1))); };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-fade-in p-4 font-sans text-slate-900">
      <div className="bg-white w-full max-w-[400px] max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden animate-fade-in-up border border-slate-200/50">
        
        {cbPromptAmount !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-slate-900/80 backdrop-blur-md rounded-[inherit]">
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 w-full shadow-2xl animate-fade-in text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 mx-auto"><CreditCard size={24} /></div>
              <h3 className="text-[16px] font-black text-slate-900 mb-1.5">Apply Cashback?</h3>
              <p className="text-slate-500 text-[13px] mb-5">Bank cashback is <strong className="text-slate-900 text-[14px]">₹{cbPromptAmount}</strong>.</p>
              <div className="flex gap-2.5">
                <button onClick={() => { setUpgradeCb(''); setCbPromptAmount(null); }} className="flex-1 py-3 rounded-xl font-bold text-[13px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Skip</button>
                <button onClick={() => { setUpgradeCb(cbPromptAmount.toString()); setCbPromptAmount(null); }} className="flex-1 py-3 rounded-xl font-bold text-[13px] bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">Apply</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-slate-100 px-3 py-2.5 flex justify-between items-center z-30 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"><ChevronLeft size={18} /></button>
            <h1 className="text-[15px] font-black text-slate-900 leading-none mt-0.5">Smart NLC</h1>
          </div>
          <div className="bg-slate-100 p-1.5 rounded-lg flex relative">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-md transition-transform duration-300 ease-out z-0 bg-white shadow-sm ${series === 'S' ? 'translate-x-0' : 'translate-x-[100%]'}`}></div>
            <button onClick={() => { setSeries('S'); setBaseType('DP'); }} className={`relative z-10 px-3 py-1 text-[10px] font-bold rounded-md ${series === 'S' ? 'text-indigo-600' : 'text-slate-500'}`}>S-Series</button>
            <button onClick={() => setSeries('A')} className={`relative z-10 px-3 py-1 text-[10px] font-bold rounded-md ${series === 'A' ? 'text-indigo-600' : 'text-slate-500'}`}>A-Series</button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-2.5 overflow-y-auto hide-scrollbar bg-slate-50">
          {initialData && initialData.model && (
            <div className="flex justify-center -mt-1 mb-0 px-1 w-full">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm max-w-full overflow-hidden">
                <Smartphone size={12} strokeWidth={2.5} className="text-slate-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 truncate pt-[1px]">
                  {parsedModelName.main}
                </span>
                {parsedModelName.sub && (
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full shrink-0 border border-indigo-100">
                    {parsedModelName.sub}
                  </span>
                )}
                <div className="w-px h-3 bg-slate-200 mx-0.5 shrink-0"></div>
                <span className="text-[10px] font-black text-emerald-600 shrink-0 pt-[1px]">
                  MOP: {initialData.mop || 'TBA'}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 shadow-sm rounded-[16px] p-3 flex flex-col gap-2.5">
            <div>
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Base Amount</label>
                <div className={`flex gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100 ${series === 'A' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <button onClick={() => setBaseType('DP')} className={`px-2.5 py-1 text-[9px] font-bold rounded-md ${baseType === 'DP' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>DP</button>
                  <button onClick={() => setBaseType('MOP')} className={`px-2.5 py-1 text-[9px] font-bold rounded-md ${baseType === 'MOP' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MOP</button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><IndianRupee size={16} /></div>
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 pl-9 pr-3 text-[16px] font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-inner" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 px-1">Sellout / Sup</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Tag size={14} /></div>
                  <input type="number" value={specialSupport} onChange={(e) => setSpecialSupport(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-9 pl-8 pr-2 text-[16px] font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-colors shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 px-1">Upg / Bank</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Gift size={14} /></div>
                  <input type="number" value={upgradeCb} onChange={(e) => setUpgradeCb(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-9 pl-8 pr-2 text-[16px] font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-colors shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[16px] p-3 shadow-sm text-[13px] shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Breakdown</h4>
            
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col justify-center shadow-sm">
                <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[9px] uppercase tracking-wide mb-1">
                  <Percent size={10} className="text-slate-400"/> Inbill (3%)
                </span>
                <span className="font-black text-slate-800 text-[13px]">-{formatCurrencyCalc(inbillMargin)}</span>
              </div>
              
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-2 flex flex-col justify-center shadow-sm">
                <span className="text-indigo-600 font-bold flex items-center gap-1.5 text-[9px] uppercase tracking-wide mb-1">
                  <Box size={10} className="text-indigo-400"/> Purchase Rate
                </span>
                <span className="font-black text-indigo-700 text-[13px]">{formatCurrencyCalc(purchaseRate)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-1">
                <Calculator size={14} className="text-slate-400"/>
                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wide">Scheme-5</span>
              </div>
              
              <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-3 shadow-inner">
                <button onClick={decreaseScheme} disabled={flatFit3Amount > 0} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-30">
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-[11px] font-black w-10 text-center text-slate-800">
                  {flatFit3Amount > 0 ? 'Flat' : `${schemePercent}%`}
                </span>
                <button onClick={increaseScheme} disabled={flatFit3Amount > 0} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-emerald-50 hover:bg-emerald-50 transition-colors disabled:opacity-30">
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>

              <span className="font-black text-indigo-600 text-[14px] text-right min-w-[70px]">-{formatCurrencyCalc(monthlyScheme)}</span>
            </div>

            {series === 'A' && (
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 animate-fade-in">
                <div className="flex items-center gap-1.5 flex-1">
                  <Star size={14} className="text-slate-400"/>
                  <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wide">Awesome Dhamaka</span>
                </div>
                
                <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-3 shadow-inner">
                  <button onClick={decreaseKro} disabled={kroPercent <= 0} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-30">
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="text-[11px] font-black w-10 text-center text-slate-800">
                    {kroPercent}%
                  </span>
                  <button onClick={increaseKro} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <span className={`font-black text-[14px] text-right min-w-[70px] ${kroPercent > 0 ? 'text-pink-600' : 'text-slate-400'}`}>
                  -{formatCurrencyCalc(kroScheme)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 pb-1 text-slate-800">
              <span className="font-bold uppercase text-[11px] tracking-wide text-slate-500">NLC Before Bank</span>
              <span className="font-black text-[14px]">{formatCurrencyCalc(nlcBeforeBank)}</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[14px] p-3 flex flex-col relative overflow-hidden shrink-0 shadow-lg mt-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center relative z-10 mb-2 gap-2">
               <div className="flex items-center bg-white/5 border border-white/10 rounded-[10px] flex-1 h-9 overflow-hidden">
                 <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider pl-2.5 pr-1.5 shrink-0">Margin</span>
                 <span className="text-white/40 text-[12px] font-bold">₹</span>
                 <input
                   type="number"
                   value={marginAmount}
                   onChange={(e) => setMarginAmount(e.target.value)}
                   placeholder="0"
                   className="flex-1 w-full bg-transparent h-full text-[14px] font-bold text-white text-right pr-2.5 focus:outline-none placeholder-white/20"
                 />
               </div>
               <button onClick={handleCopyBreakdown} className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-[10px] text-[10px] font-black transition-all shrink-0 ${copied ? 'bg-emerald-500 border border-emerald-400 text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}>
                 {copied ? <Check size={14} strokeWidth={3}/> : <ClipboardList size={14} strokeWidth={2}/>}
                 {copied ? 'Copied!' : 'Copy'}
               </button>
            </div>

            <div className="flex justify-between items-end relative z-10 pt-1.5 border-t border-white/10">
              <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest pb-0.5">
                {marginValue > 0 ? 'Quote Price' : 'Final NLC'}
              </span>
              <span className="text-[26px] font-black text-white leading-none tracking-tight select-all cursor-text">{formatCurrencyCalc(finalCustomerPrice)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('samsung_dealer_auth');
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(() => {
    return !localStorage.getItem('samassist_skip_install');
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('samsung_dealer_name') || 'Dealer';
  });
  const [hasNlcAccess, setHasNlcAccess] = useState(() => {
    return localStorage.getItem('samsung_dealer_nlc_access') === 'YES';
  });
  const [hasDpAccess, setHasDpAccess] = useState(() => {
    return localStorage.getItem('samsung_dealer_dp_access') === 'YES';
  });
  const [hasStockAccess, setHasStockAccess] = useState(() => {
    return localStorage.getItem('samsung_dealer_stock_access') === 'YES';
  });

  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('none');
  const [copyStatus, setCopyStatus] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sheetDate, setSheetDate] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(null);
  const [templateModalPhone, setTemplateModalPhone] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [calculatorData, setCalculatorData] = useState(null);
  const [inventoryModalData, setInventoryModalData] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [iframeData, setIframeData] = useState(null);
  
  const [noticeMsg, setNoticeMsg] = useState(() => {
    return localStorage.getItem('samsung_dealer_notice') || '';
  });
  
  const [noticeDate, setNoticeDate] = useState(() => {
    let d = localStorage.getItem('samsung_dealer_notice_date');
    if (!d && localStorage.getItem('samsung_dealer_notice')) {
      d = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      localStorage.setItem('samsung_dealer_notice_date', d);
    }
    return d || '';
  });
  
  const [customButtons, setCustomButtons] = useState(() => {
    try {
      const stored = localStorage.getItem('samsung_dealer_custom_btns');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });
  
  const [storeName, setStoreName] = useState(() => {
    try { return localStorage.getItem('samassist_store_name') || 'Samsung Store'; } 
    catch (e) { return 'Samsung Store'; }
  });

  const [hasAgreed, setHasAgreed] = useState(true);
  const [isOutdated, setIsOutdated] = useState(false);

  useEffect(() => {
    document.title = "SamAssist Pro";
    try {
      const lastAgreedDate = localStorage.getItem('samsung_dealer_agreed_date');
      const today = new Date().toDateString();
      if (lastAgreedDate !== today) {
        setHasAgreed(false);
      }
    } catch (e) {
      setHasAgreed(true);
    }
    
    // Prevent auto-zoom on mobile devices
    let meta = document.querySelector("meta[name='viewport']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";

    // Prevent text selection and mobile callout menus globally
    let noSelectStyle = document.getElementById('samassist-noselect');
    if (!noSelectStyle) {
      noSelectStyle = document.createElement('style');
      noSelectStyle.id = 'samassist-noselect';
      noSelectStyle.innerHTML = `
        * { -webkit-tap-highlight-color: transparent; }
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        input, textarea, select {
          -webkit-user-select: auto;
          -khtml-user-select: auto;
          -moz-user-select: auto;
          -ms-user-select: auto;
          user-select: auto;
        }
      `;
      document.head.appendChild(noSelectStyle);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.pageYOffset > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const agreeToTerms = () => {
    try {
      localStorage.setItem('samsung_dealer_agreed_date', new Date().toDateString());
    } catch (e) {}
    setHasAgreed(true);
  };

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('samsung_dealer_auth');
    localStorage.removeItem('samsung_dealer_name');
    localStorage.removeItem('samsung_dealer_nlc_access');
    localStorage.removeItem('samsung_dealer_dp_access');
    localStorage.removeItem('samsung_dealer_stock_access');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const handleLoginSuccess = (name, nlcAccess, dpAccess, stockAccess) => {
    setUserName(name);
    setHasNlcAccess(nlcAccess);
    setHasDpAccess(dpAccess);
    setHasStockAccess(stockAccess);
    setIsAuthenticated(true);
  };

  const fetchAllData = useCallback(async (isBackground = false) => {
    if (!isAuthenticated) return;
    
    if (!navigator.onLine) {
      if (!isBackground) setLoading(false);
      setIsRefreshing(false);
      showToast("You are offline. Showing cached data.");
      return;
    }

    if (!isBackground) setLoading(true); setIsRefreshing(true);
    try {
      const allResultsPromise = Promise.all(SHEET_TABS.map(tab => fetchSingleSheet(tab)));
      const imgMapPromise = fetchImageDB();
      const invMapPromise = fetchInventoryData();
      const colorMapPromise = fetchColorStockData();
      const noticeMapPromise = fetchNoticeData();

      const [allResults, imgMap, invList, colorList, noticeResult] = await Promise.all([allResultsPromise, imgMapPromise, invMapPromise, colorMapPromise, noticeMapPromise]);
      
      const combined = allResults.reduce((acc, curr) => acc.concat(curr.data || []), []);
      const fDate = allResults.map(r => r.fetchedDate).find(d => d && d.length > 0);
      if (combined.length === 0) throw new Error("No data found.");

      const imgKeys = Object.keys(imgMap).sort((a, b) => b.length - a.length);

      setPhones(prev => {
        const updated = combined.map(p => {
          const cCode = p.modelCode ? p.modelCode.toUpperCase().replace(/\s+/g, '') : '';
          const cModel = p.model ? p.model.toUpperCase().replace(/\s+/g, '') : '';
          
          let matchedImg = null;
          for (let k of imgKeys) { if (cCode.includes(k) || cModel.includes(k)) { matchedImg = imgMap[k]; break; } }
          
          let pInv = invList.filter(inv => {
            const codeMatch = cCode && inv.matchCode && (cCode.includes(inv.matchCode) || inv.matchCode.includes(cCode));
            const nameMatch = cModel && inv.mName && (cModel.includes(inv.mName) || inv.mName.includes(cModel));
            return codeMatch || nameMatch;
          });
          
          const uniqueInv = [];
          const seenImei = new Set();
          pInv.forEach(item => {
            const identifier = item.imei || (item.date + item.dp);
            if (!seenImei.has(identifier)) {
              seenImei.add(identifier);
              const colorMatch = colorList.find(c => c.pCode === item.pCode);
              uniqueInv.push({ ...item, matchedColor: item.invColor || (colorMatch ? colorMatch.color : '') });
            }
          });

          let pColors = colorList.filter(c => {
            const codeMatch = cCode && c.matchCode && (cCode.includes(c.matchCode) || c.matchCode.includes(cCode));
            const nameMatch = cModel && c.pCode && (cModel.includes(c.pCode) || c.pCode.includes(cModel));
            return codeMatch || nameMatch;
          });
          
          const colorMapAgg = {};
          pColors.forEach(item => {
             let qty = parseInt(item.stockStatus);
             if (isNaN(qty)) qty = 1; 
             if (colorMapAgg[item.color]) {
                 colorMapAgg[item.color] += qty;
             } else {
                 colorMapAgg[item.color] = qty;
             }
          });
          
          const aggregatedColors = Object.keys(colorMapAgg).map(color => ({
              color: color,
              qty: colorMapAgg[color]
          }));

          return { ...p, imageUrl: matchedImg, inventory: uniqueInv, availableColors: aggregatedColors };
        });
        
        try {
          const now = new Date();
          localStorage.setItem('samsung_dealer_data', JSON.stringify(updated));
          localStorage.setItem('samsung_dealer_sync_time', now.toISOString());
          
          const prevNotice = localStorage.getItem('samsung_dealer_notice');
          let nDate = localStorage.getItem('samsung_dealer_notice_date');
          if (noticeResult.message && noticeResult.message !== prevNotice) {
            nDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            localStorage.setItem('samsung_dealer_notice_date', nDate);
          }
          
          localStorage.setItem('samsung_dealer_notice', noticeResult.message);
          localStorage.setItem('samsung_dealer_custom_btns', JSON.stringify(noticeResult.buttons));
          if (fDate) { localStorage.setItem('samsung_dealer_sheet_date', fDate); setSheetDate(fDate); }
          
          setNoticeMsg(noticeResult.message);
          if (nDate) setNoticeDate(nDate);
          setCustomButtons(noticeResult.buttons);
          setLastSynced(now); setIsOutdated(false);
        } catch(e) {}
        
        if (!isBackground) setLoading(false);
        return updated;
      });
    } catch (err) {
      showToast("Sync failed. Check internet.");
      if (!isBackground) setLoading(false);
    } finally { setIsRefreshing(false); }
  }, [showToast, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let hasCache = false;
    try {
      const data = localStorage.getItem('samsung_dealer_data');
      const time = localStorage.getItem('samsung_dealer_sync_time');
      const date = localStorage.getItem('samsung_dealer_sheet_date');
      const btns = localStorage.getItem('samsung_dealer_custom_btns');
      const nDate = localStorage.getItem('samsung_dealer_notice_date');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) { setPhones(parsed); hasCache = true; }
        if (time) { 
            const t = new Date(time); 
            setLastSynced(t); 
            const diffInHours = (new Date() - t) / (1000 * 60 * 60);
            setIsOutdated(diffInHours > 24);
        }
        if (date) setSheetDate(date);
        if (btns) setCustomButtons(JSON.parse(btns));
        if (nDate) setNoticeDate(nDate);
      }
    } catch(e) {}
    fetchAllData(hasCache);
  }, [isAuthenticated, fetchAllData]);

  const displayPhones = useMemo(() => {
    let filtered = phones.filter(p => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (searchQuery.trim() === '') return true;
      
      const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const searchableString = `${p.model} ${p.modelCode}`.toLowerCase();
      
      return queryTerms.every(term => searchableString.includes(term));
    });

    if (sortBy === 'stock') {
      filtered = filtered.filter(p => {
        const hasInv = p.inventory && p.inventory.length > 0;
        const hasColor = p.availableColors && p.availableColors.length > 0;
        return hasInv || hasColor;
      });
    } else if (sortBy === 'low') {
      filtered = [...filtered].sort((a, b) => (a.effNum || a.mopNum) - (b.effNum || b.mopNum));
    } else if (sortBy === 'high') {
      filtered = [...filtered].sort((a, b) => (b.effNum || b.mopNum) - (a.effNum || a.mopNum));
    }
    
    return filtered;
  }, [phones, searchQuery, activeCategory, sortBy]);

  const handleToggleExpand = useCallback((id) => { setExpandedId(prev => prev === id ? null : id); setCopyStatus(null); }, []);
  
  const handleToggleCompare = useCallback((phone) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === phone.id)) {
        if (prev.length === 1 && showCompareModal) {
          setShowCompareModal(false);
        }
        return prev.filter(p => p.id !== phone.id);
      }
      if (prev.length >= 3) { 
        showToast("Max 3 models allowed for comparison."); 
        return prev; 
      }
      return [...prev, phone];
    });
  }, [showToast, showCompareModal]);
  
  const clearCompare = useCallback(() => {
    setCompareList([]);
    setShowCompareModal(false);
  }, []);

  const shareCompareWhatsApp = useCallback(() => {
    if (compareList.length === 0) return;
    let txt = `📊 *SAMSUNG GALAXY COMPARE*\n\n`;
    compareList.forEach((p, i) => {
      const sName = splitModelName(p.model);
      txt += `📱 *${sName.main}* ${sName.sub ? `_${sName.sub}_` : ''}\n`;
      txt += `💰 MOP: *${p.mop}*\n`;
      if (isValidDiscount(p.sellOut)) txt += `🏷️ Sellout: ${p.sellOut}\n`;
      if (isValidDiscount(p.upgrade)) txt += `🔄 Upgrade: ${p.upgrade}\n`;
      if (isValidDiscount(p.bank)) txt += `💳 Bank: ${p.bank}\n`;
      if (isValidDiscount(p.specialUpgrade)) txt += `⚡ Special: ${p.specialUpgrade}\n`;
      txt += `🔥 *Effective Price: ${p.effectivePrice}*\n`;
      if (i < compareList.length - 1) txt += `------------------------\n`;
    });
    if (storeName && storeName.trim()) txt += `\n📍 *Visit at:* ${storeName.trim()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  }, [compareList, storeName]);

  const generateShareText = useCallback((phone) => {
    const sName = splitModelName(phone.model);
    let txt = `📱 *${sName.main}*\n`;
    if (sName.sub) txt += `   _${sName.sub}_\n`;
    txt += `\nMOP: *${phone.mop}*\n`;
    
    if (isValidDiscount(phone.sellOut)) { const p = splitAmountAndDesc(phone.sellOut); txt += `🏷️ Sellout: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    
    const hasUpg = isValidDiscount(phone.upgrade);
    const hasBank = isValidDiscount(phone.bank);
    const isCombo = isComboOffer(phone.specialUpgrade);

    if (hasUpg) { const p = splitAmountAndDesc(phone.upgrade); txt += `🔄 Upgrade: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    if (hasUpg && hasBank && !isCombo) { txt += `   *--- OR ---*\n`; }
    if (hasBank) { const p = splitAmountAndDesc(phone.bank); txt += `💳 Bank: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    if (isValidDiscount(phone.specialUpgrade)) { const p = splitAmountAndDesc(phone.specialUpgrade); txt += `⚡ Special: ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    
    if (phone.gift) txt += `🎁 *Gift:* ${phone.gift}\n`;
    if (phone.remarks) txt += `📝 *Note:* ${phone.remarks}\n`;

    txt += `\n🔥 *Effective Price: ${phone.effectivePrice}*\n\n`;
    if (storeName && storeName.trim()) txt += `📍 *Visit at:* ${storeName.trim()}\n`;
    txt += `\n*(Note: Prices subject to change. Verify before finalizing.)*`;
    return txt;
  }, [storeName]);

  const handleCopy = useCallback((phone) => {
    const txt = generateShareText(phone);
    const el = document.createElement("textarea"); 
    el.value = txt; 
    el.style.position = 'fixed'; 
    el.style.top = '0';
    el.style.left = '0';
    el.style.opacity = '0';
    document.body.appendChild(el); 
    el.focus();
    el.select();
    try { 
      document.execCommand('copy'); 
      setCopyStatus(phone.id); 
      setTimeout(() => setCopyStatus(null), 2000); 
      showToast("Copied to clipboard!");
    } catch (e) {
      showToast("Failed to copy. Feature not supported.");
    }
    document.body.removeChild(el);
  }, [generateShareText, showToast]);

  const handleWhatsApp = useCallback((phone) => { window.open(`https://wa.me/?text=${encodeURIComponent(generateShareText(phone))}`, '_blank'); }, [generateShareText]);
  const handleOpenTemplateModal = useCallback((phone) => setTemplateModalPhone(phone), []);
  const handleOpenCalculator = useCallback((phone) => setCalculatorData(phone), []);
  const handleOpenInventory = useCallback((phone) => setInventoryModalData(phone), []);

  const handleGenerateImageWrapper = async (phone, templateId) => {
    setTemplateModalPhone(null);
    setIsGeneratingImg(phone.id);
    try {
      await generatePosterImage(phone, templateId, storeName);
    } catch (e) {
      showToast("Poster generation failed.");
    } finally {
      setIsGeneratingImg(null);
    }
  };

  const categories = ['All', ...SHEET_TABS.map(t => t.name)];
  
  const gridColsClass = compareList.length === 1 ? 'grid-cols-2' : compareList.length === 2 ? 'grid-cols-3' : 'grid-cols-4';

  if (!isAuthenticated) {
    if (showInstallPrompt) {
      return <InstallPrompt onContinue={() => {
        localStorage.setItem('samassist_skip_install', 'true');
        setShowInstallPrompt(false);
      }} />;
    }
    return <SecurityLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen font-sans pb-12 bg-[#F8FAFC] text-slate-900 relative">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        body { overscroll-behavior-y: none; }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      {toastMsg && (
        <div className="fixed bottom-12 left-0 right-0 z-[300] flex justify-center pointer-events-none px-4">
          <div className="bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-full shadow-2xl text-[13px] font-bold flex items-center justify-center gap-2 animate-fade-in-up pointer-events-auto">
            <Check size={16} className="text-emerald-400" />
            {toastMsg}
          </div>
        </div>
      )}

      {calculatorData !== null && (
        <NlcCalculator onClose={() => setCalculatorData(null)} initialData={calculatorData} showToast={showToast} />
      )}

      {inventoryModalData !== null && (
        <InventoryModal phone={inventoryModalData} onClose={() => setInventoryModalData(null)} />
      )}

      {compareList.length > 0 && !showCompareModal && calculatorData === null && inventoryModalData === null && (
        <div className="fixed bottom-5 inset-x-0 z-[80] flex justify-center px-4 animate-fade-in pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[20px] shadow-lg p-3.5 flex items-center justify-between gap-4 w-full max-w-sm pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {compareList.map(p => (
                  <div key={p.id} className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[9px] font-bold overflow-hidden shadow-sm">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt=""/> : (p.modelCode || '').substring(0,2)}
                  </div>
                ))}
              </div>
              <span className="text-[12px] font-extrabold text-slate-700 leading-tight">{compareList.length}/3</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearCompare} className="text-[11px] font-bold text-slate-500 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200">Clear</button>
              <button onClick={() => setShowCompareModal(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-indigo-700">Compare <ArrowRight size={14}/></button>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && calculatorData === null && inventoryModalData === null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center sm:p-4 bg-[#F8FAFC] sm:bg-slate-900/60 sm:backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F8FAFC] w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl sm:rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden animate-fade-in-up">
            <div className="shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2"><Layers size={20} className="text-indigo-600"/> Compare</h2>
              <div className="flex items-center gap-2">
                <button onClick={shareCompareWhatsApp} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors"><MessageCircle size={20}/></button>
                <button onClick={() => setShowCompareModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 hide-scrollbar">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="min-w-[300px]">
                    <div className={`grid ${gridColsClass} gap-1.5 bg-slate-50 p-2 border-b border-slate-100`}>
                      <div className="flex items-end justify-center text-[10px] font-bold text-slate-400 uppercase pb-2">Specs</div>
                      {compareList.map(p => (
                        <div key={p.id} className="flex flex-col items-center text-center gap-1.5 p-1 relative pt-2">
                          <button onClick={() => handleToggleCompare(p)} className="absolute top-0 right-0 sm:right-2 bg-red-100 text-red-600 p-1 rounded-full shadow-sm hover:bg-red-200 transition-colors z-10"><X size={12}/></button>
                          <div className="w-12 h-12 bg-white rounded-xl p-1.5 border border-slate-100 flex items-center justify-center shadow-sm">
                            {p.imageUrl ? <img src={p.imageUrl} className="max-h-full object-contain" alt=""/> : <CustomSamsungIcon className="text-slate-300" size={18}/>}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight break-words px-1 text-balance">{splitModelName(p.model).main}</span>
                        </div>
                      ))}
                    </div>

                    {[
                      { label: 'MOP', key: 'mop', color: 'text-slate-900 font-bold' },
                      { label: 'Effective', key: 'effectivePrice', color: 'text-indigo-700 font-black bg-indigo-50/50' },
                      { label: 'Upgrade', key: 'upgrade', color: 'text-purple-600 font-semibold' },
                      { label: 'Bank', key: 'bank', color: 'textemerald-600 font-semibold' },
                      { label: 'Sellout', key: 'sellOut', color: 'text-slate-600 font-semibold' },
                      { label: 'Special', key: 'specialUpgrade', color: 'text-amber-600 font-semibold' }
                    ].map((row) => (
                      <div key={row.label} className={`grid ${gridColsClass} gap-1.5 border-b border-slate-100 last:border-0 py-3 items-stretch ${row.key === 'effectivePrice' ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase text-center px-1">{row.label}</div>
                        {compareList.map(p => (
                          <div key={p.id} className={`flex items-center justify-center text-center text-[11px] sm:text-[12px] break-words px-1 py-1 rounded-md ${row.color}`}>
                            {p[row.key] || '-'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {templateModalPhone && calculatorData === null && inventoryModalData === null && (
        <PosterTemplateModal 
          phone={templateModalPhone} 
          onGenerate={handleGenerateImageWrapper} 
          onClose={() => setTemplateModalPhone(null)} 
        />
      )}

      {!hasAgreed && calculatorData === null && inventoryModalData === null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-[340px] w-full p-6 text-center animate-fade-in">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto"><ShieldAlert size={28} /></div>
            <h2 className="text-[18px] font-black text-slate-900 mb-3">Disclaimer</h2>
            <div className="text-[12px] text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left space-y-2">
              <p className="font-bold text-slate-800">This data is for reference purposes only.</p>
              <p>Please read the scheme details carefully or contact your area sales team for more information.</p>
              <p className="text-red-500 font-bold mt-1">We are not liable for any loss or discrepancies.</p>
            </div>
            <button onClick={agreeToTerms} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">I Agree & Continue</button>
          </div>
        </div>
      )}

      {isOutdated && calculatorData === null && inventoryModalData === null && !isOffline && (
        <div className="bg-red-50 text-red-600 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold sticky top-0 z-40 border-b border-red-100">
          <div className="flex items-center gap-1.5"><AlertCircle size={16} /><span>Data might be outdated.</span></div>
          <button onClick={() => fetchAllData(false)} className="bg-red-100 px-3 py-1 rounded-md text-red-700 hover:bg-red-200">Refresh</button>
        </div>
      )}

      <header className={`bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm ${(isOutdated || isOffline) ? 'sticky top-9 z-30' : 'sticky top-0 z-30'}`}>
        {isOffline && (
          <div className="bg-rose-500 text-white px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold">
            <WifiOff size={14} /> You are offline. Showing saved data.
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-3.5">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2.5">
              <SamAssistIcon size={32} />
              <div className="flex flex-col">
                <h1 className="text-[18px] font-black leading-none text-slate-900 tracking-tight">SamAssist</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{userName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasNlcAccess && (
                <button onClick={() => setCalculatorData({})} className="bg-indigo-50 text-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm hover:bg-indigo-100 transition-colors">
                  <Calculator size={18} strokeWidth={2.5} />
                </button>
              )}
              
              <button onClick={() => fetchAllData(false)} className="bg-slate-50 text-slate-600 border border-slate-200 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm relative hover:bg-slate-100 transition-colors">
                {isRefreshing && <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>}
                <RefreshCw size={16} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-800 transition-colors">
                <Menu size={18} />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-4 top-[55px] w-64 rounded-[16px] shadow-xl border border-slate-200 bg-white z-50 animate-fade-in origin-top-right overflow-hidden">
                    <a href={WA_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-3.5 flex items-center gap-2.5 bg-[#F0FDF4] border-b border-slate-100 hover:bg-[#dcfce7]">
                      <div className="bg-green-500 text-white p-1.5 rounded-lg"><MessageCircle size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-green-600 uppercase">Community</span><span className="text-[13px] font-black text-slate-900">WhatsApp Group</span></div>
                    </a>
                    <div className="px-4 py-3.5 border-b border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Store Name</label>
                      <input type="text" value={storeName} onChange={(e) => { setStoreName(e.target.value); localStorage.setItem('samassist_store_name', e.target.value); }} placeholder="Enter Store Name" className="w-full text-[16px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                    </div>
                    <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-slate-100">
                      <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg"><Calendar size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Sheet Date</span><span className="text-[12px] font-bold text-slate-800">{sheetDate || 'N/A'}</span></div>
                    </div>
                    <a href="https://youtube.com/@MabArena" target="_blank" rel="noopener noreferrer" className="px-4 py-3.5 flex items-center gap-2.5 border-b border-slate-100 hover:bg-slate-50">
                      <div className="bg-red-50 text-red-600 p-1.5 rounded-lg"><Youtube size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Developer</span><span className="text-[12px] font-bold text-slate-800">Mab Arena</span></div>
                    </a>
                    <button onClick={handleLogout} className="w-full px-4 py-3.5 flex items-center gap-2.5 hover:bg-red-50 text-left transition-colors">
                      <div className="bg-slate-100 text-slate-600 p-1.5 rounded-lg"><LogIn size={16} className="rotate-180" /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Account</span><span className="text-[12px] font-bold text-red-600">Logout User</span></div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative mb-3.5">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input 
              type="text" 
              placeholder="Search models or codes..." 
              className="bg-slate-100 border-none text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-300 w-full pl-10 pr-3 py-3 rounded-xl text-[16px] font-bold shadow-inner outline-none transition-colors" 
              value={searchInput} 
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value.trim() !== '') {
                  setActiveCategory('All');
                }
              }} 
            />
          </div>

          <div className="flex items-center relative">
            <div className="relative shrink-0 z-10 mr-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className={`appearance-none pl-3 pr-7 py-2 rounded-lg text-[11px] font-bold border outline-none shadow-sm transition-colors ${sortBy !== 'none' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <option value="none">Sort By</option>
                <option value="low">Low Price</option>
                <option value="high">High Price</option>
                {hasStockAccess && <option value="stock">In Stock</option>}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
            <div className="flex overflow-x-auto gap-2 hide-scrollbar flex-1 pr-2 items-center">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-bold border transition-colors ${activeCategory === category ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{category}</button>
              ))}
              
              {customButtons.length > 0 && (
                <div className="w-px h-6 bg-slate-200 mx-0.5 shrink-0"></div>
              )}
              
              {customButtons.map((btn, idx) => (
                <button 
                  key={`custom-btn-${idx}`} 
                  onClick={() => setIframeData({ url: btn.url, title: btn.name })}
                  className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-lg text-[11px] font-bold border transition-colors bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 shadow-sm"
                >
                  {btn.name} <ArrowRight size={12} strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 relative">
        {loading && phones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="text-indigo-500 h-8 w-8 animate-spin mb-3" />
            <p className="font-bold text-[12px] text-slate-500">Syncing Prices & Inventory...</p>
          </div>
        ) : (
          <>
            {noticeMsg && (
              <div className="mb-5 relative rounded-[20px] p-4 sm:p-5 flex items-start gap-3.5 shadow-sm border border-indigo-100/50 animate-fade-in overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80">
                {/* Subtle side accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                
                {/* Decorative soft background glow */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Premium Icon Box */}
                <div className="bg-white shadow-sm p-2.5 rounded-xl shrink-0 relative border border-slate-100/80 z-10">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-md rounded-xl"></div>
                  <MessageCircle size={20} className="text-indigo-600 relative z-10" />
                </div>
                
                {/* Text Content */}
                <div className="flex flex-col pt-0.5 w-full z-10 relative">
                  <div className="flex justify-between items-start mb-1.5 w-full">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        Important Notice
                      </span>
                    </div>
                    {noticeDate && (
                      <span className="text-[9px] font-bold text-slate-400 bg-indigo-50/50 px-1.5 py-0.5 rounded shadow-sm border border-indigo-100/50">
                        {noticeDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{noticeMsg}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3.5">
              {displayPhones.length > 0 ? (
                displayPhones.map((phone) => (
                  <PhoneCard 
                    key={phone.id}
                    phone={phone} 
                    isExpanded={expandedId === phone.id} 
                    isSelectedForCompare={!!compareList.find(p => p.id === phone.id)}
                    onToggleExpand={handleToggleExpand}
                    onToggleCompare={handleToggleCompare}
                    onCopy={handleCopy}
                    copyStatus={copyStatus}
                    onWhatsApp={handleWhatsApp}
                    onGenerateImage={handleOpenTemplateModal}
                    isGenerating={isGeneratingImg}
                    onOpenCalc={handleOpenCalculator}
                    onOpenInventory={handleOpenInventory}
                    hasNlcAccess={hasNlcAccess}
                    hasDpAccess={hasDpAccess}
                    hasStockAccess={hasStockAccess}
                  />
                ))
              ) : (
                <div className="bg-white py-12 px-4 text-center rounded-[20px] border border-dashed border-slate-200">
                  <Search className="text-slate-300 h-10 w-10 mx-auto mb-2" />
                  <h3 className="text-[14px] font-bold text-slate-900">No Models Found</h3>
                </div>
              )}
            </div>

            {displayPhones.length > 0 && (
              <div className="mt-8 mb-4 bg-slate-50 border border-slate-200 rounded-[20px] p-5 text-center shadow-sm">
                <ShieldAlert size={20} className="text-slate-400 mx-auto mb-2" />
                <p className="text-[12px] font-bold text-slate-700 mb-1">This data is for reference purposes only.</p>
                <p className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">Please read the scheme details carefully or contact your area sales team for more information.</p>
                <p className="text-[11px] font-bold text-red-500/80">We are not liable for any loss or discrepancies.</p>
              </div>
            )}
          </>
        )}
      </main>

      {iframeData && (
        <div className="fixed inset-0 z-[400] bg-[#F8FAFC] flex flex-col animate-fade-in">
          {/* Custom Header for Portal */}
          <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center justify-between z-20 shadow-sm shrink-0">
            <button 
              onClick={() => setIframeData(null)} 
              className="flex items-center gap-1 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors font-bold text-[12px] pr-4 shadow-inner"
            >
              <ChevronLeft size={18} strokeWidth={3} />
              <span>Back</span>
            </button>
            <h2 className="text-[14px] font-black text-slate-900 truncate px-4 flex-1 text-center">{iframeData.title}</h2>
            <button 
              onClick={() => setIframeData(null)} 
              className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-600 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Iframe Window */}
          <div className="flex-1 relative w-full h-full bg-slate-50">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <RefreshCw className="text-indigo-300 h-8 w-8 animate-spin" />
            </div>
            <iframe 
              src={iframeData.url} 
              className="absolute inset-0 w-full h-full border-none z-10 bg-transparent"
              title={iframeData.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            ></iframe>
          </div>
        </div>
      )}
      
      {showScroll && (
        <button onClick={scrollTop} className="bg-indigo-600 text-white fixed bottom-5 right-5 p-3.5 rounded-full shadow-lg z-50 flex items-center justify-center hover:bg-indigo-700 hover:-translate-y-1 transition-all">
          <ArrowUp size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
