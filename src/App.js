import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Search, AlertCircle, RefreshCw, ChevronDown, Tag, Gift, MessageCircle, Copy, 
  ArrowUp, ArrowDown, Check, Menu, Calendar, ShieldAlert, Youtube, Zap, Camera, 
  CreditCard, TrendingUp, X, Calculator, Percent, Layers, Box, 
  Minus, Plus, IndianRupee, Star, ChevronLeft, ArrowRight, ClipboardList, 
  Smartphone, LogIn, Lock, Eye, EyeOff, Home, Maximize, WifiOff, Download,
  MapPin, ArrowRightLeft, ShoppingCart, CheckCircle, ScanLine, ShieldCheck,
  FileText, History, Clock
} from 'lucide-react';

// ==========================================
// SHARED CONSTANTS & ICONS
// ==========================================
const CustomSamsungIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4.5" y="1.5" width="15" height="21" rx="4" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8.5" cy="5.5" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="9" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="12.5" r="1.2" fill="currentColor" />
    <circle cx="11.5" cy="7" r="0.7" fill="currentColor" />
  </svg>
);

const SamAssistIcon = ({ size = 28, className = "" }) => (
  <div className={`bg-gradient-to-b from-gray-700 to-black text-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] ${className || 'rounded-[10px]'}`} style={{ width: size, height: size, minWidth: size }}>
    <IndianRupee size={size * 0.55} strokeWidth={3} />
  </div>
);

const StockIcon = ({ size = 28, className = "" }) => (
  <div className={`bg-gradient-to-b from-gray-700 to-black text-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] ${className || 'rounded-[10px]'}`} style={{ width: size, height: size, minWidth: size }}>
    <Box size={size * 0.55} strokeWidth={2.5} />
  </div>
);

// --- OFFERS APP CONSTANTS ---
const BASE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1uipnUzwMNwBJWRJ6qhp4RPnlpuBHwYGaWbwEsmatHJY/export?format=csv&gid=";
const IMAGE_DB_URL = "https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=0";
const NOTICE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=689704684";
const ADMIN_WHATSAPP_NUMBER = "918888851642"; 
const AUTH_SHEET_URL = "https://docs.google.com/spreadsheets/d/1QRvpQkJeFEdbx6L4zcZ_UT6fByAGz5odsd8HhASCwME/export?format=csv&gid=1959501734";
const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VaxSwIM9Bb60YWXF8C3v";

const SHEET_TABS = [
  { name: 'A Series', gid: '2014959364' },
  { name: 'S & FE Series', gid: '2085730153' },
  { name: 'M & F Series', gid: '327181163' },
  { name: 'Tab Series', gid: '255331010' },
  { name: 'Gear Bud', gid: '596867009' }
];

// --- STOCK APP CONSTANTS ---
const STOCK_SHEET_ID = "1OR61dDEtCan2CufmV4UXYtLtQIFuX0MTSIKMJ9kA_RU";
const STOCK_GID = "1255047374";
const INVENTORY_CSV_URL = `https://docs.google.com/spreadsheets/d/${STOCK_SHEET_ID}/export?format=csv&gid=${STOCK_GID}`;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLC648rHuI9aVbzEsZBBJatjlMDuuCSI0W0IKWIpb8w5h9bL7cJsvYtwRTOPI9b6N2Zg/exec"; 


// ==========================================
// SHARED HELPER FUNCTIONS
// ==========================================
const csvToArray = (text) => {
  if (!text) return [];
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

const calculateStockAge = (dateStr) => {
  if (!dateStr || dateStr.toLowerCase() === 'n/a' || dateStr.trim() === '') return -1;
  let d = new Date(dateStr);
  const parts = dateStr.trim().split(/[-/ \s]+/);
  if (parts.length >= 3) {
    let day = parseInt(parts[0], 10);
    let monthStr = parts[1];
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    let month = isNaN(parseInt(monthStr)) ? months[monthStr.toLowerCase().substring(0,3)] : parseInt(monthStr) - 1;
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) d = new Date(year, month, day);
  }
  if (isNaN(d.getTime())) return -1;
  const now = new Date(); now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDateForSheet = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const formatPrice = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  return str.includes('₹') ? str : `₹${str}`;
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// ==========================================
// OFFERS MODULE COMPONENTS (SamAssist Pro)
// ==========================================
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
        if (!message && rows[i][0]) {
          const val = String(rows[i][0]).trim();
          if (val && val.toUpperCase() !== 'MESSAGE') { message = val; }
        }
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

const fetchImageDB = async () => {
  try {
    const res = await fetch(IMAGE_DB_URL); if (!res.ok) return {};
    const rows = csvToArray(await res.text()); const imgMap = {};
    rows.forEach(row => {
      if (row.length >= 2 && row[0] && row[1]) {
        const code = String(row[0]).trim().toUpperCase().replace(/\s+/g, '');
        let url = String(row[1]).trim();
        let fileId = null;
        if (url.includes('/file/d/')) {
          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (match) fileId = match[1];
        } else if (url.includes('open?id=')) {
          const match = url.match(/id=([a-zA-Z0-9_-]+)/); if (match) fileId = match[1];
        } else if (url.includes('uc?')) {
          const match = url.match(/id=([a-zA-Z0-9_-]+)/); if (match) fileId = match[1];
        }
        if (fileId) url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
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
        const up = val.toUpperCase(); return (up === '0' || up === 'NA' || up === '-' || up === 'NULL' || up === '') ? null : val;
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
        imageUrl: null
      });
    }
    return { data: parsedData, fetchedDate };
  } catch (e) { return { data: [], fetchedDate: null }; }
};

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

  const drawRoundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r); ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath();
  };

  const drawDynamicOfferRow = (ctx, label, val, subtext, y, leftX, rightX, maxSubW, colorLabel, colorVal, colorSub) => {
    ctx.fillStyle = colorLabel; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(label, leftX, y);
    ctx.fillStyle = colorVal; ctx.font = '900 36px sans-serif'; ctx.textAlign = 'right';
    let displayVal = val.includes('-') ? val : `- ${val}`;
    if(label === 'Special Offer:' && !val.includes('-')) displayVal = val;
    ctx.fillText(displayVal, rightX, y);
    let nextY = y + 10;
    if (subtext) {
      ctx.fillStyle = colorSub; ctx.font = '22px sans-serif'; ctx.textAlign = 'right';
      const words = String(subtext).split(' '); let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (ctx.measureText(test).width > maxSubW && i > 0) {
          ctx.fillText(line.trim(), rightX, nextY + 25); line = words[i] + ' '; nextY += 30;
        } else { line = test; }
      }
      if(line.trim()) { ctx.fillText(line.trim(), rightX, nextY + 25); nextY += 30; }
    }
    return nextY + 45; 
  };

  const sn = splitModelName(phone.model); const sText = storeName ? storeName.toUpperCase() : 'SAMSUNG EXPERIENCE STORE';
  let displayModelName = sn.main.toUpperCase();
  if (!displayModelName.includes('GALAXY')) displayModelName = 'GALAXY ' + displayModelName;

  const sOutVal = parsePriceToNumber(splitAmountAndDesc(phone.sellOut).amount);
  const upgVal = parsePriceToNumber(splitAmountAndDesc(phone.upgrade).amount);
  const bankVal = parsePriceToNumber(splitAmountAndDesc(phone.bank).amount);
  const spclVal = parsePriceToNumber(splitAmountAndDesc(phone.specialUpgrade).amount);
  const isCombo = isComboOffer(phone.specialUpgrade);

  let maxUpgBank = isCombo ? (upgVal + bankVal) : Math.max(upgVal, bankVal);
  let posterEffNum = phone.mopNum - sOutVal - spclVal - maxUpgBank;
  let posterEffectivePrice = phone.effectivePrice;
  if (posterEffNum > 0 && phone.mopNum > 0) posterEffectivePrice = formatCurrency(posterEffNum);

  const themes = {
    'midnight-card': { bgMain: '#1e2133', bgCard: '#ffffff', textMain: '#0f172a', textSub: '#64748b', boxBg: '#0f172a', boxText: '#ffffff', headerMain: '#ffffff', headerSub: '#94a3b8', divider: '#e2e8f0', gradientBg: true, gradientColors: ['#16192b', '#0b0c16'], colors: { sellout: '#059669', upgrade: '#a21caf', bank: '#2563eb', special: '#d97706' } },
    'dark-glass': { bgMain: '#000000', bgCard: 'rgba(24, 24, 27, 0.8)', textMain: '#ffffff', textSub: '#a1a1aa', boxBg: '#ffffff', boxText: '#18181b', headerMain: '#ffffff', headerSub: '#a1a1aa', divider: '#27272a', gradientBg: false, colors: { sellout: '#34d399', upgrade: '#c084fc', bank: '#38bdf8', special: '#fbbf24' } },
    'vibrant-glass': { bgMain: '#c026d3', bgCard: 'rgba(255, 255, 255, 0.95)', textMain: '#0f172a', textSub: '#64748b', boxBg: '#0f172a', boxText: '#ffffff', headerMain: '#ffffff', headerSub: 'rgba(255, 255, 255, 0.8)', divider: '#e2e8f0', gradientBg: false, colors: { sellout: '#059669', upgrade: '#7c3aed', bank: '#0284c7', special: '#ea580c' } }
  };
  const t = themes[templateId] || themes['midnight-card'];

  if (templateId === 'vibrant-glass') {
    ctx.fillStyle = '#9333ea'; ctx.fillRect(0,0,1080,1920); 
    const drawOrb = (x, y, r, color) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI); const grd = ctx.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, color); grd.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = grd; ctx.fill(); };
    drawOrb(100, 200, 800, '#f97316'); drawOrb(900, 1700, 1000, '#0ea5e9'); drawOrb(1080, 200, 700, '#c026d3'); 
  } else if (t.gradientBg) {
    const grd = ctx.createLinearGradient(0,0,0,1920); grd.addColorStop(0, t.gradientColors[0]); grd.addColorStop(1, t.gradientColors[1]); ctx.fillStyle = grd; ctx.fillRect(0,0,1080,1920);
  } else {
    ctx.fillStyle = t.bgMain; ctx.fillRect(0,0,1080,1920);
    if (templateId === 'dark-glass') { ctx.beginPath(); ctx.arc(540, 500, 500, 0, 2*Math.PI); const glow = ctx.createRadialGradient(540, 500, 0, 540, 500, 500); glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fill(); }
  }

  ctx.fillStyle = t.headerMain; ctx.font = '900 65px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EXCLUSIVE DEAL', 540, 100);
  ctx.fillStyle = t.headerSub; ctx.font = 'bold 28px sans-serif'; ctx.fillText('GRAB IT BEFORE IT\'S GONE', 540, 150);

  const cardX = 80, cardY = 200, cardW = 920, cardH = 1460;
  if (templateId === 'dark-glass') {
    ctx.fillStyle = t.bgCard; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 50); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 50); ctx.stroke();
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; ctx.fillStyle = t.bgCard; drawRoundRect(ctx, cardX, cardY, cardW, cardH, 40); ctx.fill(); ctx.shadowColor = 'transparent';
  }

  let currentY = cardY + 50;
  if (imgObj) {
    const sX = imgObj.width * 0.15; const sY = 0; const sW = imgObj.width * 0.70; const sH = imgObj.height;
    const maxImgW = cardW * 0.65; const maxImgH = 420; const ratio = Math.min(maxImgW/sW, maxImgH/sH); const drawW = sW * ratio, drawH = sH * ratio;
    ctx.drawImage(imgObj, sX, sY, sW, sH, 540 - (drawW/2), currentY + (maxImgH - drawH)/2, drawW, drawH); currentY += maxImgH + 40;
  } else { currentY += 420 + 40; }

  ctx.fillStyle = t.textMain; ctx.font = '900 60px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(displayModelName, 540, currentY); currentY += 45;
  if (sn.sub) { ctx.fillStyle = (templateId === 'vibrant-glass') ? '#dc2626' : t.textSub; ctx.font = 'bold 26px sans-serif'; ctx.fillText(sn.sub.toUpperCase(), 540, currentY); currentY += 60; } else currentY += 40;

  ctx.strokeStyle = t.divider; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cardX + 50, currentY); ctx.lineTo(cardX + cardW - 50, currentY); ctx.stroke(); currentY += 60;

  const tLeft = cardX + 60, tRight = cardX + cardW - 60, maxW = cardW * 0.55;
  currentY = drawDynamicOfferRow(ctx, 'MOP Price:', phone.mop, null, currentY, tLeft, tRight, maxW, t.textSub, t.textMain, t.textSub);
  
  if(isValidDiscount(phone.sellOut)) { const p = splitAmountAndDesc(phone.sellOut); currentY = drawDynamicOfferRow(ctx, 'Sellout Support:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.sellout, t.textSub); }
  const hasUpg = isValidDiscount(phone.upgrade); const hasBank = isValidDiscount(phone.bank);
  if(hasUpg) { const p = splitAmountAndDesc(phone.upgrade); currentY = drawDynamicOfferRow(ctx, 'Upgrade Bonus:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.upgrade, t.textSub); }
  if (hasUpg && hasBank && !isCombo) { ctx.fillStyle = t.divider; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('━━━ OR ━━━', 540, currentY); currentY += 45; }
  if(hasBank) { const p = splitAmountAndDesc(phone.bank); currentY = drawDynamicOfferRow(ctx, 'Bank Offer:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.bank, t.textSub); }
  if(isValidDiscount(phone.specialUpgrade)) { const p = splitAmountAndDesc(phone.specialUpgrade); currentY = drawDynamicOfferRow(ctx, 'Special Offer:', p.amount, p.desc, currentY, tLeft, tRight, maxW, t.textSub, t.colors.special, t.textSub); }

  const boxH = 180; const boxY = cardY + cardH - boxH - 40; 
  ctx.fillStyle = t.boxBg; drawRoundRect(ctx, cardX + 40, boxY, cardW - 80, boxH, 24); ctx.fill();
  ctx.fillStyle = (templateId === 'dark-glass') ? '#71717a' : '#94a3b8'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EFFECTIVE PRICE', 540, boxY + 60);
  ctx.fillStyle = t.boxText; ctx.font = '900 85px sans-serif'; ctx.fillText(posterEffectivePrice, 540, boxY + 140);

  ctx.fillStyle = t.headerSub; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Visit at', 540, cardY + cardH + 70);
  ctx.fillStyle = t.headerMain; ctx.font = '900 45px sans-serif'; ctx.fillText(sText, 540, cardY + cardH + 120);
  ctx.fillStyle = t.headerSub; ctx.font = '22px sans-serif'; ctx.fillText('Developed by Mab Arena', 540, cardY + cardH + 170);

  const link = document.createElement('a'); link.download = `Offer_${sn.main.replace(/\s+/g,'_')}.jpg`; link.href = canvas.toDataURL('image/jpeg', 0.95); link.click();
};

const PosterTemplateModal = memo(({ phone, onGenerate, onClose }) => {
  if (!phone) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-[420px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative animate-fade-in-up border border-white/50">
        <div className="p-5 text-center border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-lg">
          <h3 className="text-[16px] font-extrabold text-slate-900 pl-2">Select Design</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3 bg-white">
          <button onClick={() => onGenerate(phone, 'midnight-card')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[24px] bg-[#16192b] border-2 border-transparent group-hover:border-black group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all flex flex-col items-center justify-center p-2"><div className="w-full h-full bg-white rounded-[16px] shadow-sm flex flex-col items-center p-2"><div className="w-8 h-8 bg-gray-100 rounded-[12px] mb-1"></div><div className="w-12 h-1.5 bg-gray-800 rounded-full mb-1 mt-auto"></div><div className="w-full h-5 bg-gray-900 rounded-[8px]"></div></div></div><span className="text-[11px] font-bold text-gray-700">Midnight</span>
          </button>
          <button onClick={() => onGenerate(phone, 'dark-glass')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[24px] bg-black border-2 border-transparent group-hover:border-black group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all flex flex-col items-center justify-center p-2 relative overflow-hidden"><div className="absolute top-4 w-12 h-12 bg-cyan-500/30 blur-md rounded-full"></div><div className="absolute bottom-2 w-[90%] h-[55%] bg-zinc-800/80 rounded-[16px] border border-zinc-700 flex flex-col justify-end p-2"><div className="w-full h-4 bg-white rounded-[8px]"></div></div></div><span className="text-[11px] font-bold text-gray-700">Glass</span>
          </button>
          <button onClick={() => onGenerate(phone, 'vibrant-glass')} className="group flex flex-col items-center text-center gap-2">
            <div className="w-full aspect-[4/5] rounded-[24px] bg-gradient-to-br from-orange-400 via-purple-500 to-cyan-500 border-2 border-transparent group-hover:border-black group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all flex flex-col items-center justify-center p-2 relative overflow-hidden"><div className="w-full h-full bg-white/90 rounded-[16px] shadow-sm flex flex-col items-center p-2"><div className="w-8 h-8 bg-gray-100 rounded-[12px] mb-1"></div><div className="w-12 h-1.5 bg-gray-400 rounded-full mb-1 mt-auto"></div><div className="w-full h-5 bg-gray-900 rounded-[8px]"></div></div></div><span className="text-[11px] font-bold text-gray-700">Vibrant</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const PhoneCard = memo(({ phone, isExpanded, isSelectedForCompare, onToggleExpand, onToggleCompare, onCopy, copyStatus, onWhatsApp, onGenerateImage, isGenerating, onOpenCalc, hasNlcAccess, hasDpAccess, onOpenCheaperStock, hasLowerDpAccess }) => {
  const hasBank = isValidDiscount(phone.bank); const hasUpg = isValidDiscount(phone.upgrade); const hasSellOut = isValidDiscount(phone.sellOut); const hasSpcl = isValidDiscount(phone.specialUpgrade); const isCombo = isComboOffer(phone.specialUpgrade);
  const sellOutDetails = splitAmountAndDesc(phone.sellOut); const upgradeDetails = splitAmountAndDesc(phone.upgrade); const bankDetails = splitAmountAndDesc(phone.bank); const specialDetails = splitAmountAndDesc(phone.specialUpgrade);
  const parsedName = useMemo(() => splitModelName(phone.model), [phone.model]);
  const isWideDevice = phone.category === 'Tab Series' || phone.category === 'Gear Bud';
  
  const stockTotal = phone.stockTotal || 0;
  const stockColors = phone.stockColors || {};

  const currentDpNum = parsePriceToNumber(phone.dp); // Live DP
  const cheaperStock = (phone.inventory || []).filter(item => {
    const oldDpNum = parsePriceToNumber(item.dp); // Purchased DP
    return oldDpNum > 0 && oldDpNum < currentDpNum; // Comparison
  });

  return (
    <div className={`bg-white rounded-[28px] transition-all duration-300 relative border border-white/80 overflow-hidden ${isExpanded ? 'shadow-[0_12px_40px_rgba(0,0,0,0.06)] z-10 scale-[1.01]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]'}`}>
      {isCombo && <div className="absolute top-0 right-0 bg-gradient-to-r from-gray-800 to-black text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-bl-[20px] z-10 shadow-sm">Combo Offer</div>}
      <div onClick={() => onToggleExpand(phone.id)} className="flex justify-between items-center p-3 sm:p-4 cursor-pointer">
        <div className="flex items-center gap-3 sm:gap-4 w-[75%] pr-2">
          <div className="relative w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] shrink-0">
            {stockTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-black min-w-[24px] h-[24px] px-1 flex items-center justify-center rounded-full shadow-sm z-10 border-[2.5px] border-white">
                {stockTotal}
              </span>
            )}
            <div className="w-full h-full rounded-[16px] sm:rounded-[20px] bg-gray-50 flex items-center justify-center overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
              {phone.imageUrl ? <img src={phone.imageUrl} alt="" loading="lazy" decoding="async" className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-300 animate-fade-in ${isWideDevice ? 'scale-100 p-1' : 'scale-[1.3]'}`} /> : <CustomSamsungIcon className="text-gray-400" size={28} />}
            </div>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-gray-500 leading-none">{phone.modelCode}</span>
            </div>
            <h3 className="text-[14px] sm:text-[15px] font-extrabold text-slate-900 leading-tight break-words">{parsedName.main}</h3>
            {parsedName.sub && <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 leading-tight mt-0.5 break-words">{parsedName.sub}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right"><p className="text-[8px] sm:text-[9px] font-bold uppercase text-gray-400 leading-none mb-1">MOP</p><p className="text-[15px] sm:text-[16px] font-black text-slate-900 leading-none tracking-tight">{phone.mop}</p></div>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-black text-white rotate-180' : 'bg-gray-100 text-gray-500 rotate-0'}`}><ChevronDown size={16} strokeWidth={3} /></div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0 animate-fade-in origin-top">
          {stockTotal > 0 && (
            <div className="flex justify-between items-center mb-3">
               <div className="flex flex-wrap gap-2">
                  {Object.entries(stockColors).map(([color, count]) => (
                     <div key={color} className="flex items-center bg-gray-50 border border-gray-200 rounded-[8px] pl-2 pr-1 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-700 capitalize mr-2">{color}</span>
                        <span className="bg-white text-slate-700 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-[6px] text-[9px] font-black border border-gray-200 shadow-sm">{count}</span>
                     </div>
                  ))}
               </div>
               {cheaperStock.length > 0 && hasDpAccess && hasLowerDpAccess && (
                  <button onClick={(e) => { e.stopPropagation(); onOpenCheaperStock({ phone, cheaperStock, currentDpNum }); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-[8px] text-[10px] font-black flex items-center gap-1 shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all active:scale-95 shrink-0">
                     <ArrowDown size={12} strokeWidth={3}/> LOWER DP
                  </button>
               )}
            </div>
          )}

          <div className="bg-[#F8F9FA] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 mb-3 border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-gray-200/60">
              <span className="text-[11px] sm:text-[12px] font-bold text-gray-500">Dealer Price</span>
              {hasDpAccess ? <span className="text-[14px] font-black text-slate-900">{phone.dp}</span> : <span className="text-[11px] font-bold text-gray-400 bg-gray-200/50 px-2.5 py-1 rounded-[10px] flex items-center gap-1.5"><Lock size={12} /> Restricted</span>}
            </div>
            <div className="space-y-2.5">
              {hasSellOut && <div className="flex flex-col"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><Tag size={14} className="text-emerald-500" /><span className="text-[12px] font-semibold text-slate-700">Sellout</span></div><span className="text-[12px] font-bold text-emerald-600">- {formatSafePrice(sellOutDetails.amount)}</span></div>{sellOutDetails.desc && <div className="text-[10px] text-gray-400 text-right mt-0.5 leading-tight">{sellOutDetails.desc}</div>}</div>}
              {hasUpg && <div className="flex flex-col"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><TrendingUp size={14} className="text-purple-500" /><span className="text-[12px] font-semibold text-slate-700">Upgrade</span></div><span className="text-[12px] font-bold text-purple-600">- {formatSafePrice(upgradeDetails.amount)}</span></div>{upgradeDetails.desc && <div className="text-[10px] text-gray-400 text-right mt-0.5 leading-tight">{upgradeDetails.desc}</div>}</div>}
              {hasUpg && hasBank && !isCombo && <div className="flex items-center justify-center py-1 opacity-40"><div className="h-px bg-gray-400 w-8"></div><span className="mx-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">OR</span><div className="h-px bg-gray-400 w-8"></div></div>}
              {hasBank && <div className="flex flex-col"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><CreditCard size={14} className="text-blue-500" /><span className="text-[12px] font-semibold text-slate-700">Bank Offer</span></div><span className="text-[12px] font-bold text-blue-600">- {formatSafePrice(bankDetails.amount)}</span></div>{bankDetails.desc && <div className="text-[10px] text-gray-400 text-right mt-0.5 leading-tight">{bankDetails.desc}</div>}</div>}
              {hasSpcl && <div className="flex flex-col"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><Zap size={14} className="text-amber-500 fill-amber-500" /><span className="text-[12px] font-semibold text-slate-700">Special</span></div><span className="text-[12px] font-bold text-amber-600">{formatSafePrice(specialDetails.amount)}</span></div>{specialDetails.desc && <div className="text-[10px] text-gray-400 text-right mt-0.5 leading-tight">{specialDetails.desc}</div>}</div>}
              {(!hasSellOut && !hasUpg && !hasBank && !hasSpcl) && <div className="text-center text-[11px] text-gray-400 py-1">No additional offers</div>}
            </div>
          </div>

          {(phone.gift || phone.remarks) && (
            <div className="bg-[#FFF9F0] border border-[#FFE8CC] rounded-[20px] p-4 mb-3 space-y-2.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)]">
              {phone.gift && <div className="flex items-start gap-2.5"><Gift size={16} className="text-amber-500 mt-0.5 shrink-0" /><div className="flex flex-col"><span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 mb-0.5">Gift</span><span className="text-[12px] font-bold text-amber-900 leading-tight">{phone.gift}</span></div></div>}
              {phone.remarks && <div className={`flex items-start gap-2.5 ${phone.gift ? 'pt-2.5 border-t border-[#FFE8CC]' : ''}`}><AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" /><div className="flex flex-col"><span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 mb-0.5">Note</span><span className="text-[12px] font-bold text-blue-900 leading-tight">{phone.remarks}</span></div></div>}
            </div>
          )}

          <div className="bg-black rounded-[24px] py-4 px-4 text-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">Live Effective Price</p>
            <p className="text-[22px] font-black tracking-tight text-white">{phone.effectivePrice}</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button onClick={(e) => { e.stopPropagation(); onCopy(phone); }} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] transition-all bg-gray-50 hover:bg-gray-100 text-slate-800 font-bold text-[10px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]">{copyStatus === phone.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}{copyStatus === phone.id ? 'Copied' : 'Copy'}</button>
            <button onClick={(e) => { e.stopPropagation(); onGenerateImage(phone); }} disabled={isGenerating === phone.id} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] transition-all bg-gray-50 hover:bg-gray-100 text-slate-800 font-bold text-[10px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] disabled:opacity-50">{isGenerating === phone.id ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}Poster</button>
            <button onClick={(e) => { e.stopPropagation(); onWhatsApp(phone); }} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] transition-all bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] font-bold text-[10px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]"><MessageCircle size={16} className="text-[#22C55E]" />Share</button>
            <button onClick={(e) => { e.stopPropagation(); onToggleCompare(phone); }} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] transition-all font-bold text-[10px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] ${isSelectedForCompare ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100 text-slate-800'}`}><Layers size={16}/>{isSelectedForCompare ? 'Added' : 'Compare'}</button>
          </div>
          
          {hasNlcAccess ? <button onClick={(e) => { e.stopPropagation(); onOpenCalc(phone); }} className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-[20px] font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-[0_8px_16px_rgba(0,0,0,0.15)]"><Calculator size={16} /> Smart Calculator</button> : <div className="w-full bg-gray-100 text-gray-400 py-3.5 rounded-[20px] font-bold text-[12px] flex items-center justify-center gap-2"><Lock size={14} /> Calculator Restricted</div>}
        </div>
      )}
    </div>
  );
});

const CheaperStockModal = memo(({ data, onClose }) => {
  if (!data) return null;
  const { phone, cheaperStock, currentDpNum } = data;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-[#F8F9FA] w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh] animate-fade-in-up border border-white">
          
          {/* Header */}
          <div className="px-5 py-4 flex justify-between items-center bg-white z-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0">
             <div className="flex items-center gap-3">
                <div className="bg-emerald-50 w-10 h-10 rounded-[14px] flex items-center justify-center"><Box size={20} className="text-emerald-600" strokeWidth={2.5}/></div>
                <div>
                   <h3 className="text-[16px] font-black text-slate-900 leading-tight">Shop Stock Info</h3>
                   <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{splitModelName(phone.model).main}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"><X size={18} strokeWidth={2.5}/></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 hide-scrollbar">
             
             {/* Current Live DP Card */}
             <div className="flex justify-between items-center bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                <span className="text-[11px] font-black text-gray-500 tracking-widest uppercase">Current Live DP</span>
                <span className="text-[20px] font-black text-slate-900 leading-none">{formatCurrency(currentDpNum).replace('₹', '')}</span>
             </div>

             {/* Cheaper Stock Items */}
             <div className="space-y-3 pb-4">
                {cheaperStock.map((item, idx) => {
                   const oldDpNum = parsePriceToNumber(item.dp);
                   const savings = currentDpNum - oldDpNum;
                   const oldMopNum = parsePriceToNumber(item.mop);
                   const oldDpDetails = splitAmountAndDesc(item.dp);
                   
                   return (
                      <div key={idx} className="bg-white border border-emerald-100/80 rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(16,185,129,0.04)] transition-shadow">
                         
                         {/* Top Section: Model, Color, Outlet */}
                         <div className="p-4 relative bg-gradient-to-b from-[#F4FDF8]/50 to-white">
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-[6px] flex items-center gap-1 uppercase tracking-widest shadow-sm">
                               <ArrowDown size={10} strokeWidth={3}/> Cheaper
                            </div>
                            
                            <h4 className="text-[14px] font-black text-slate-900 pr-20 leading-tight">{item.mName || phone.model}</h4>
                            
                            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                               <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-[6px] uppercase tracking-wide border border-blue-100/50">
                                  {item.pCode} • {item.color}
                               </span>
                               <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-[6px] flex items-center gap-1 uppercase border border-rose-100/50">
                                  <MapPin size={10}/> {item.outlet}
                               </span>
                            </div>
                         </div>
                         
                         {/* Middle Section: IMEI & Date */}
                         <div className="px-4 py-3 bg-gray-50/50 border-t border-b border-gray-100 flex justify-between items-center gap-2">
                            <div className="flex-1 min-w-0">
                               <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">IMEI / Serial No</span>
                               <span className="text-[12px] font-black text-slate-700 tracking-wider truncate block">{item.imei}</span>
                            </div>
                            <div className="text-right shrink-0">
                               <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tertiary Date</span>
                               <div className="flex items-center justify-end gap-1.5">
                                  <span className="text-[12px] font-bold text-slate-700">{item.date}</span>
                                  {item.age >= 0 && <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-200/50 px-1.5 py-0.5 rounded-[6px] whitespace-nowrap leading-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">{item.age} Days</span>}
                               </div>
                            </div>
                         </div>

                         {/* Bottom Section: Pricing Details */}
                         <div className="p-4 grid grid-cols-2 gap-4 items-start bg-[#F4FDF8]/30">
                            <div>
                               <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Old MOP</span>
                               <span className="text-[15px] font-black text-slate-600 line-through decoration-slate-300 mt-1 block">{oldMopNum > 0 ? formatCurrency(oldMopNum) : (item.mop || 'N/A')}</span>
                            </div>
                            <div className="text-right">
                               <span className="block text-[9px] font-bold text-emerald-700/60 uppercase tracking-widest mb-1">Old Purchased DP</span>
                               <div className="flex items-start justify-end gap-2 mt-1">
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[6px] border border-emerald-200/50 mt-0.5 whitespace-nowrap">Save {formatCurrency(savings)}</span>
                                  <div className="flex flex-col items-end">
                                      <span className="text-[18px] font-black text-emerald-600 leading-none">{formatCurrency(oldDpNum).replace('₹', '')}</span>
                                      {oldDpDetails.desc && (
                                          <span className="text-[9px] font-bold text-emerald-600/80 mt-1.5 leading-tight break-words text-right max-w-[100px]">
                                              {oldDpDetails.desc}
                                          </span>
                                      )}
                                  </div>
                               </div>
                            </div>
                         </div>

                      </div>
                   );
                })}
             </div>
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
  const [isKroEnabled, setIsKroEnabled] = useState(false);

  const parsedModelName = useMemo(() => { if (!initialData || !initialData.model) return { main: 'Model', sub: '' }; return splitModelName(initialData.model); }, [initialData]);

  useEffect(() => {
    if (initialData && initialData.model) {
      const categoryStr = (initialData.category || '').toUpperCase(); const modelStr = (initialData.model || '').toUpperCase();
      const isASeries = categoryStr.includes('A SERIES') || categoryStr.includes('M & F'); setSeries(isASeries ? 'A' : 'S');
      const dpNum = parsePriceToNumber(initialData.dp); const mopNum = parsePriceToNumber(initialData.mop); let workingBase = 0;
      if (dpNum > 0) { setBaseType('DP'); setInputValue(dpNum.toString()); workingBase = dpNum; } 
      else if (mopNum > 0 && isASeries) { setBaseType('MOP'); setInputValue(mopNum.toString()); workingBase = mopNum / 1.04; } 
      else if (mopNum > 0) { setBaseType('DP'); setInputValue(mopNum.toString()); workingBase = mopNum; }
      const sellOutNum = parsePriceToNumber(splitAmountAndDesc(initialData.sellOut).amount); if (sellOutNum > 0) setSpecialSupport(sellOutNum.toString()); else setSpecialSupport('');
      const upgNum = parsePriceToNumber(splitAmountAndDesc(initialData.upgrade).amount); const spclUpNum = parsePriceToNumber(splitAmountAndDesc(initialData.specialUpgrade).amount); const bnkNum = parsePriceToNumber(splitAmountAndDesc(initialData.bank).amount);
      const isCombo = isComboOffer(initialData.specialUpgrade);
      if (isCombo) { const totalUpgBank = upgNum + spclUpNum + bnkNum; setUpgradeCb(totalUpgBank > 0 ? totalUpgBank.toString() : ''); setCbPromptAmount(null); } else {
          const totalUpgrade = upgNum + spclUpNum;
          if (totalUpgrade > 0) { setUpgradeCb(totalUpgrade.toString()); setCbPromptAmount(null); } else if (bnkNum > 0) { setCbPromptAmount(bnkNum); setUpgradeCb(''); } else { setUpgradeCb(''); setCbPromptAmount(null); }
      }
      let calculatedScheme = 6.5; 
      if (categoryStr.includes('GEAR BUD') || modelStr.includes('WATCH') || modelStr.includes('BUDS') || modelStr.includes('RING') || modelStr.includes('FIT')) {
          if (modelStr.includes('FIT 3')) { calculatedScheme = 0; setFlatFit3Amount(350); } else if (modelStr.includes('BUDS')) calculatedScheme = 15.5; else if (modelStr.includes('WATCH') || modelStr.includes('RING')) calculatedScheme = 9.5;
      } else if (categoryStr.includes('M & F SERIES') || modelStr.match(/[MF]\d{2}/)) {
          if (modelStr.includes('M56') || modelStr.includes('F56') || modelStr.includes('F17')) calculatedScheme = workingBase >= 20000 ? 6.5 : 5.5; else calculatedScheme = 2.0;
      } else { calculatedScheme = workingBase >= 20000 ? 6.5 : 5.5; }
      setSchemePercent(calculatedScheme);
      setIsKroEnabled(false);
    }
  }, [initialData]);

  const rawInput = Number(inputValue) || 0; const specialSupportValue = Number(specialSupport) || 0; const upgradeCbValue = Number(upgradeCb) || 0;
  const isMop = series === 'A' && baseType === 'MOP'; const actualDp = isMop ? (rawInput / 1.04) : rawInput;
  const inbillMargin = Math.round(actualDp * 0.03) || 0; const purchaseRate = Math.round(actualDp - inbillMargin) || 0; 
  const monthlyBase = Math.max(0, actualDp - specialSupportValue) || 0; 
  const monthlyScheme = flatFit3Amount > 0 ? flatFit3Amount : (Math.round((monthlyBase / 1.18) * (schemePercent / 100)) || 0);
  const kroScheme = (series === 'A' && isKroEnabled) ? (Math.round((monthlyBase / 1.18) * (kroPercent / 100)) || 0) : 0;
  const nlcBeforeBank = Math.round(actualDp - inbillMargin - monthlyScheme - kroScheme - specialSupportValue) || 0;
  const finalNlc = Math.round(nlcBeforeBank - upgradeCbValue) || 0;
  const marginValue = Number(marginAmount) || 0; const finalCustomerPrice = (finalNlc + marginValue) || 0;

  const formatCurrencyCalc = (amount) => { const val = Number(amount); if (isNaN(val)) return '₹0'; return '₹' + val.toLocaleString('en-IN'); };

  const handleCopyBreakdown = () => {
    let copyText = '';
    if (marginValue > 0) {
        copyText += `📱 *${parsedModelName.main} ${parsedModelName.sub}`.trim() + `*\n`;
        copyText += `🏷️ MOP: *${initialData.mop || 'TBA'}*\n\n`;
        if (upgradeCbValue > 0) {
            let label = "Offers Applied";
            const bnkAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.bank).amount);
            const upgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.upgrade).amount);
            const spclUpgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.specialUpgrade).amount);
            if (upgradeCbValue === bnkAmt && bnkAmt > 0) { label = "Bank Cashback Included"; } else if (upgradeCbValue === (upgAmt + spclUpgAmt) && (upgAmt + spclUpgAmt) > 0) { label = "Upgrade Bonus Included"; } else { label = "Card / Upgrade Offers Included"; }
            copyText += `🎁 *(${label})*\n\n`;
        }
        copyText += `🔥 *Offer Price: ${formatCurrencyCalc(finalCustomerPrice)}*`;
    } else {
        copyText += `📱 *${parsedModelName.main} ${parsedModelName.sub}`.trim() + `*\n`;
        copyText += `🏷️ MOP : *${initialData.mop || 'TBA'}*\n\n`;
        copyText += `💰 Base (${baseType}) : *${formatCurrencyCalc(rawInput)}*\n`;
        if (specialSupportValue > 0) { const spclDesc = splitAmountAndDesc(initialData?.sellOut).desc; copyText += `🎁 Sellout : *-${formatCurrencyCalc(specialSupportValue)}* ${spclDesc ? `(${spclDesc})` : ''}\n`; }
        copyText += `➖ Inbill (3%) : *-${formatCurrencyCalc(inbillMargin)}*\n`;
        copyText += `📦 Purchase Rate : *${formatCurrencyCalc(purchaseRate)}*\n`;
        copyText += `➖ Scheme-5 (${flatFit3Amount > 0 ? 'Flat' : schemePercent + '%'}) : *-${formatCurrencyCalc(monthlyScheme)}*\n`;
        if (series === 'A' && kroPercent > 0 && isKroEnabled) { copyText += `➖ Awesome Dhamaka (${kroPercent}%) : *-${formatCurrencyCalc(kroScheme)}*\n`; }
        copyText += `------------------------\n`;
        copyText += `📉 NLC : *${formatCurrencyCalc(nlcBeforeBank)}*\n`;
        if (upgradeCbValue > 0) {
            let label = "Upg / Bank"; let extraNote = "";
            const bnkAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.bank).amount);
            const upgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.upgrade).amount);
            const spclUpgAmt = parsePriceToNumber(splitAmountAndDesc(initialData?.specialUpgrade).amount);
            if (upgradeCbValue === bnkAmt && bnkAmt > 0) { label = "Bank Cb"; const desc = splitAmountAndDesc(initialData?.bank).desc; if (desc) extraNote = `\n   ↳ 💳 _${desc}_`; } else if (upgradeCbValue === (upgAmt + spclUpgAmt) && (upgAmt + spclUpgAmt) > 0) { label = "Upgrade Bonus"; const desc1 = splitAmountAndDesc(initialData?.upgrade).desc; const desc2 = splitAmountAndDesc(initialData?.specialUpgrade).desc; const combinedDesc = [desc1, desc2].filter(Boolean).join(' | '); if (combinedDesc) extraNote = `\n   ↳ 🔄 _${combinedDesc}_`; } else { label = "Upg/Bank Offer"; const desc1 = splitAmountAndDesc(initialData?.bank).desc; const desc2 = splitAmountAndDesc(initialData?.upgrade).desc; const combinedDesc = [desc1, desc2].filter(Boolean).join(' | '); if (combinedDesc) extraNote = `\n   ↳ ℹ️ _${combinedDesc}_`; }
            copyText += `🎁 ${label} : *-${formatCurrencyCalc(upgradeCbValue)}*${extraNote}\n`; copyText += `------------------------\n`;
        }
        copyText += `🔥 *FINAL NLC : ${formatCurrencyCalc(finalNlc)}*`;
    }
    const el = document.createElement("textarea"); el.value = copyText; el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); if (showToast) showToast("Breakdown Copied!"); } catch (err) { if (showToast) showToast("Failed to copy"); } document.body.removeChild(el);
  };

  const decreaseScheme = () => { if (schemePercent > 0.0) setSchemePercent(prev => parseFloat((prev - 0.5).toFixed(1))); }; const increaseScheme = () => { if (schemePercent < 20.0) setSchemePercent(prev => parseFloat((prev + 0.5).toFixed(1))); };
  const decreaseKro = () => { if (kroPercent > 0.0) setKroPercent(prev => parseFloat((prev - 0.5).toFixed(1))); }; const increaseKro = () => { if (kroPercent < 3.0) setKroPercent(prev => parseFloat((prev + 0.5).toFixed(1))); };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-3 sm:p-4 font-sans text-slate-900">
      <div className="bg-[#F8F9FA] w-full max-w-[380px] rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden animate-fade-in-up border border-white/50">

        {/* Dynamic Cashback Prompt Overlay */}
        {cbPromptAmount !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-md rounded-[inherit]"><div className="bg-white border border-gray-100 rounded-[28px] p-5 w-full shadow-2xl animate-fade-in text-center"><div className="w-12 h-12 bg-gray-100 text-black rounded-[18px] flex items-center justify-center mb-3 mx-auto"><CreditCard size={22} /></div><h3 className="text-[16px] font-black text-slate-900 mb-1">Apply Cashback?</h3><p className="text-gray-500 text-[12px] mb-5">Bank cashback is <strong className="text-slate-900 text-[14px]">₹{cbPromptAmount}</strong>.</p><div className="flex gap-2.5"><button onClick={() => { setUpgradeCb(''); setCbPromptAmount(null); }} className="flex-1 py-3 rounded-[16px] font-bold text-[13px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Skip</button><button onClick={() => { setUpgradeCb(cbPromptAmount.toString()); setCbPromptAmount(null); }} className="flex-1 py-3 rounded-[16px] font-bold text-[13px] bg-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:bg-gray-800 transition-colors">Apply</button></div></div></div>
        )}

        {/* Compact Header */}
        <div className="bg-white px-4 py-3 flex justify-between items-center z-30 shrink-0 border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-500 transition-colors"><ChevronLeft size={20} /></button>
            <h1 className="text-[15px] font-extrabold text-slate-900 tracking-tight">Smart NLC</h1>
          </div>
          <div className="bg-gray-100 p-0.5 rounded-[10px] flex relative">
            <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[8px] transition-transform duration-300 ease-out z-0 bg-white shadow-sm ${series === 'S' ? 'translate-x-0' : 'translate-x-[100%]'}`}></div>
            <button onClick={() => { setSeries('S'); setBaseType('DP'); }} className={`relative z-10 px-3 py-1 text-[10px] font-black rounded-[8px] ${series === 'S' ? 'text-slate-900' : 'text-gray-500'}`}>S-Series</button>
            <button onClick={() => setSeries('A')} className={`relative z-10 px-3 py-1 text-[10px] font-black rounded-[8px] ${series === 'A' ? 'text-slate-900' : 'text-gray-500'}`}>A-Series</button>
          </div>
        </div>

        {/* Body Container (Scrollable if necessary, but tightly packed) */}
        <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto hide-scrollbar">

          {/* Compact Model Info Pill */}
          {initialData && initialData.model && (
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-[14px] shadow-sm border border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Smartphone size={14} strokeWidth={2.5} className="text-gray-400 shrink-0" />
                <span className="text-[11px] font-black text-slate-800 truncate leading-tight pt-0.5">{parsedModelName.main} {parsedModelName.sub}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2 bg-gray-50 px-2 py-0.5 rounded-[8px]">
                <span className="text-[9px] font-bold text-gray-400 uppercase">MOP</span>
                <span className="text-[11px] font-black text-slate-800">{initialData.mop || 'TBA'}</span>
              </div>
            </div>
          )}

          {/* Compact Inputs Grid Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-[18px] p-3 flex flex-col gap-2.5 shrink-0">
            {/* Base Amount Row */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-[12px] p-1 border border-gray-100/50 focus-within:bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <div className="pl-2 text-gray-400"><IndianRupee size={16} strokeWidth={2.5}/></div>
              <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                 <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Base Amount</span>
                 <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="0" className="w-full bg-transparent border-none p-0 text-[16px] font-black text-slate-900 focus:ring-0 outline-none leading-tight" />
              </div>
              <div className={`flex bg-gray-200/60 p-0.5 rounded-[8px] shrink-0 mr-1 ${series === 'A' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <button onClick={() => setBaseType('DP')} className={`px-2 py-1 text-[9px] font-black rounded-[6px] ${baseType === 'DP' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}>DP</button>
                <button onClick={() => setBaseType('MOP')} className={`px-2 py-1 text-[9px] font-black rounded-[6px] ${baseType === 'MOP' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}>MOP</button>
              </div>
            </div>

            {/* 2-Column Sellout & Bank Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-[12px] p-1.5 border border-gray-100/50 focus-within:bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <div className="pl-1.5 text-gray-400"><Tag size={14} strokeWidth={2.5}/></div>
                <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                   <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Sellout / Sup</span>
                   <input type="number" value={specialSupport} onChange={(e) => setSpecialSupport(e.target.value)} placeholder="0" className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-slate-900 focus:ring-0 outline-none leading-tight" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-[12px] p-1.5 border border-gray-100/50 focus-within:bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <div className="pl-1.5 text-gray-400"><Gift size={14} strokeWidth={2.5}/></div>
                <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                   <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Upg / Bank</span>
                   <input type="number" value={upgradeCb} onChange={(e) => setUpgradeCb(e.target.value)} placeholder="0" className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-slate-900 focus:ring-0 outline-none leading-tight" />
                </div>
              </div>
            </div>
          </div>

          {/* Compact Breakdown Details Card */}
          <div className="bg-white rounded-[18px] px-3 py-2 shadow-sm border border-gray-100 flex flex-col gap-0.5 shrink-0">
            {/* Top Stats */}
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-bold flex items-center gap-1.5 text-[10px] uppercase tracking-wide"><Percent size={12} className="text-gray-400"/> Inbill (3%)</span>
              <span className="font-black text-slate-800 text-[12px]">-{formatCurrencyCalc(inbillMargin)}</span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50 bg-gray-50/50 px-2 -mx-2 rounded-[6px]">
              <span className="text-slate-700 font-bold flex items-center gap-1.5 text-[10px] uppercase tracking-wide"><Box size={12} className="text-slate-500"/> Purchase Rate</span>
              <span className="font-black text-slate-900 text-[12px]">{formatCurrencyCalc(purchaseRate)}</span>
            </div>

            {/* Scheme Controls */}
            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <div className="flex items-center gap-1.5 flex-1">
                <Calculator size={12} className="text-gray-400"/>
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wide">Scheme-5</span>
              </div>
              <div className="flex items-center bg-gray-50 rounded-[6px] p-0.5 mr-2 border border-gray-100">
                <button onClick={decreaseScheme} disabled={flatFit3Amount > 0} className="w-5 h-5 flex items-center justify-center bg-white rounded-[4px] shadow-sm text-gray-600 hover:text-black disabled:opacity-30"><Minus size={10} strokeWidth={3} /></button>
                <span className="text-[10px] font-black w-8 text-center text-slate-800 pt-[1px]">{flatFit3Amount > 0 ? 'Flat' : `${schemePercent}%`}</span>
                <button onClick={increaseScheme} disabled={flatFit3Amount > 0} className="w-5 h-5 flex items-center justify-center bg-white rounded-[4px] shadow-sm text-gray-600 hover:text-black disabled:opacity-30"><Plus size={10} strokeWidth={3} /></button>
              </div>
              <span className="font-black text-slate-800 text-[12px] text-right min-w-[60px]">-{formatCurrencyCalc(monthlyScheme)}</span>
            </div>

            {/* Awesome Dhamaka Component (A-Series Only) */}
            {series === 'A' && (
              <div className={`flex justify-between items-center py-1.5 border-b border-gray-50 transition-all ${isKroEnabled ? '' : 'opacity-60 grayscale-[50%]'}`}>
                <div className="flex items-center gap-1.5 flex-1 cursor-pointer" onClick={() => setIsKroEnabled(!isKroEnabled)}>
                  <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${isKroEnabled ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-transparent shadow-sm'}`}>
                    <Check size={10} strokeWidth={4} />
                  </div>
                  <Star size={12} className={isKroEnabled ? "text-amber-500" : "text-gray-400"}/>
                  <span className={`font-bold text-[10px] uppercase tracking-wide pt-[1px] ${isKroEnabled ? 'text-slate-800' : 'text-gray-500'}`}>Awesome Dhamaka</span>
                </div>
                <div className={`flex items-center bg-gray-50 rounded-[6px] p-0.5 mr-2 border border-gray-100 ${!isKroEnabled ? 'pointer-events-none opacity-50' : ''}`}>
                  <button onClick={decreaseKro} disabled={kroPercent <= 0} className="w-5 h-5 flex items-center justify-center bg-white rounded-[4px] shadow-sm text-gray-600 hover:text-black disabled:opacity-30"><Minus size={10} strokeWidth={3} /></button>
                  <span className="text-[10px] font-black w-8 text-center text-slate-800 pt-[1px]">{kroPercent}%</span>
                  <button onClick={increaseKro} className="w-5 h-5 flex items-center justify-center bg-white rounded-[4px] shadow-sm text-gray-600 hover:text-black"><Plus size={10} strokeWidth={3} /></button>
                </div>
                <span className={`font-black text-[12px] text-right min-w-[60px] ${isKroEnabled && kroPercent > 0 ? 'text-slate-800' : 'text-gray-400'}`}>
                  {isKroEnabled ? `-${formatCurrencyCalc(kroScheme)}` : '₹0'}
                </span>
              </div>
            )}

            {/* Total Before Bank */}
            <div className="flex justify-between items-center py-2 text-slate-800">
              <span className="font-extrabold uppercase text-[10px] tracking-widest text-gray-500">NLC Before Bank</span>
              <span className="font-black text-[14px]">{formatCurrencyCalc(nlcBeforeBank)}</span>
            </div>
          </div>

          {/* Premium Bottom Action Bar (Margin & Total) */}
          <div className="bg-slate-900 rounded-[18px] p-3 flex flex-col relative overflow-hidden mt-auto shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center relative z-10 mb-2 gap-2">
               <div className="flex items-center bg-white/10 rounded-[10px] flex-1 h-8 overflow-hidden backdrop-blur-sm border border-white/5 focus-within:bg-white/20 transition-colors">
                  <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest pl-2 pr-1 shrink-0 pt-[1px]">Margin</span>
                  <span className="text-white/40 text-[11px] font-bold">₹</span>
                  <input type="number" value={marginAmount} onChange={(e) => setMarginAmount(e.target.value)} placeholder="0" className="flex-1 w-full bg-transparent h-full text-[13px] font-bold text-white text-right pr-2 focus:outline-none placeholder-white/20 pt-[1px]"/>
               </div>
               <button onClick={handleCopyBreakdown} className={`flex items-center justify-center gap-1.5 px-3 h-8 rounded-[10px] text-[10px] font-bold transition-all shrink-0 uppercase tracking-wide pt-[1px] ${copied ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}>
                  {copied ? <Check size={12} strokeWidth={3}/> : <ClipboardList size={12} strokeWidth={2.5}/>}
                  {copied ? 'Copied' : 'Copy'}
               </button>
            </div>

            <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/10">
               <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest pb-0.5">{marginValue > 0 ? 'Quote Price' : 'Final NLC'}</span>
               <span className="text-[26px] font-black text-white leading-none tracking-tighter select-all cursor-text">{formatCurrencyCalc(finalCustomerPrice)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

// ==========================================
// OFFERS VIEW (Main Tab)
// ==========================================
const OffersView = memo(({ userName, hasNlcAccess, hasDpAccess, allowedOutlets, hasLowerDpAccess, stockAccess, handleLogout, showToast, refreshAuth }) => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('none');
  const [copyStatus, setCopyStatus] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sheetDate, setSheetDate] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(null);
  const [templateModalPhone, setTemplateModalPhone] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [calculatorData, setCalculatorData] = useState(null);
  const [iframeData, setIframeData] = useState(null);
  const [noticeMsg, setNoticeMsg] = useState(() => localStorage.getItem('samsung_dealer_notice') || '');
  const [noticeDate, setNoticeDate] = useState(() => { let d = localStorage.getItem('samsung_dealer_notice_date'); if (!d && localStorage.getItem('samsung_dealer_notice')) { d = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); localStorage.setItem('samsung_dealer_notice_date', d); } return d || ''; });
  const [customButtons, setCustomButtons] = useState(() => { try { const stored = localStorage.getItem('samsung_dealer_custom_btns'); return stored ? JSON.parse(stored) : []; } catch (e) { return []; } });
  const [storeName, setStoreName] = useState(() => { try { return localStorage.getItem('samassist_store_name') || 'Samsung Store'; } catch (e) { return 'Samsung Store'; } });
  const [isOutdated, setIsOutdated] = useState(false);
  const [cheaperStockModalData, setCheaperStockModalData] = useState(null);

  useEffect(() => { const handleScroll = () => setShowScroll(window.pageYOffset > 200); window.addEventListener('scroll', handleScroll, { passive: true }); return () => window.removeEventListener('scroll', handleScroll); }, []);
  useEffect(() => { const timer = setTimeout(() => { setSearchQuery(searchInput); }, 300); return () => clearTimeout(timer); }, [searchInput]);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const isOutletAllowed = useCallback((outlet) => {
    if (!allowedOutlets || allowedOutlets === 'NONE') return false; 
    if (allowedOutlets === 'ALL') return true;
    const allowedArr = allowedOutlets.split(',').map(s => s.trim().toUpperCase());
    return allowedArr.includes(outlet.toUpperCase());
  }, [allowedOutlets]);

  const fetchAllData = useCallback(async (isBackground = false) => {
    if (!navigator.onLine) { if (!isBackground) { setLoading(false); setIsRefreshing(false); showToast("You are offline. Showing cached data."); } return; }
    if (!isBackground) { setLoading(true); setIsRefreshing(true); }
    
    // Auto sync permissions in background
    if (refreshAuth) await refreshAuth();

    try {
      const allResultsPromise = Promise.all(SHEET_TABS.map(tab => fetchSingleSheet(tab)));
      const imgMapPromise = fetchImageDB(); 
      const noticeMapPromise = fetchNoticeData();
      const invPromise = fetch(INVENTORY_CSV_URL).then(r => r.text()).catch(() => ""); 

      const [allResults, imgMap, noticeResult, invText] = await Promise.all([allResultsPromise, imgMapPromise, noticeMapPromise, invPromise]);
      const combined = allResults.reduce((acc, curr) => acc.concat(curr.data || []), []);
      const fDate = allResults.map(r => r.fetchedDate).find(d => d && d.length > 0);
      if (combined.length === 0) throw new Error("No data found.");
      const imgKeys = Object.keys(imgMap).sort((a, b) => b.length - a.length);

      let inventoryData = [];
      if (invText) {
          const rows = csvToArray(invText);
          inventoryData = rows.slice(1).filter(row => {
              if (!row || row.length < 8) return false;
              const avail = String(row[7] || '').trim().toUpperCase();
              return avail && !['0', 'NO', 'FALSE', 'SOLD'].includes(avail);
          }).map(row => {
              const avail = String(row[7] || '').trim().toUpperCase();
              return {
                  pCode: String(row[0] || '').trim().toUpperCase(),
                  mName: String(row[1] || '').trim().toUpperCase(),
                  color: toTitleCase(String(row[2] || '').trim()),
                  imei: String(row[3] || '').trim().toUpperCase(),
                  date: String(row[4] || '').trim(),
                  dp: String(row[5] || '').trim(),
                  mop: String(row[6] || '').trim(),
                  outlet: ['YES', 'TRUE', 'MAIN STORE', 'YS'].includes(avail) ? 'YS' : avail,
                  age: calculateStockAge(String(row[4] || '').trim())
              };
          });
      }

      const updatedPhones = combined.map(p => {
        const actualModelCode = p.modelCode ? p.modelCode.toUpperCase().replace(/\s+/g, '') : ''; 
        const cleanPhoneModel = p.model ? p.model.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
        
        let matchedImg = null; 
        for (let k of imgKeys) { if (actualModelCode.includes(k) || cleanPhoneModel.includes(k)) { matchedImg = imgMap[k]; break; } }
        
        const stockItems = inventoryData.filter(inv => {
            if (!inv.pCode) return false;
            if (!isOutletAllowed(inv.outlet)) return false;

            const offerNameStr = (p.model || '').toUpperCase().replace(/\s+/g, '');
            const invNameStr = (inv.mName || '').toUpperCase().replace(/\s+/g, '');
            
            const isOfferWT = offerNameStr.includes('WT/TA');
            const isOfferWO = offerNameStr.includes('WO/TA');
            const isInvWT = invNameStr.includes('WT/TA');
            const isInvWO = invNameStr.includes('WO/TA');
            
            if (isOfferWT && (!isInvWT || isInvWO)) return false;
            if (isOfferWO && (!isInvWO || isInvWT)) return false;

            let rawPCode = inv.pCode.toUpperCase();
            let matchCode = rawPCode.replace(/\s+/g, '');
            
            if (matchCode.startsWith('SM-')) {
              const base5 = matchCode.substring(3, 8); 
              let variant = '';
              if (matchCode.length >= 11) variant = matchCode.substring(10, 11); 
              matchCode = base5 + variant; 
            }
            
            if (actualModelCode && (matchCode === actualModelCode || matchCode.includes(actualModelCode) || actualModelCode.includes(matchCode))) return true;
            
            const cleanInvModel = (inv.mName || '').replace(/[^A-Z0-9]/g, '');
            if (!actualModelCode && cleanInvModel && cleanInvModel.includes(cleanPhoneModel) && cleanPhoneModel.length > 4) return true;
            return false;
        });

        const stockTotal = stockItems.length;
        const stockColors = stockItems.reduce((acc, item) => {
            const c = item.color || 'Unknown';
            acc[c] = (acc[c] || 0) + 1;
            return acc;
        }, {});

        return { ...p, imageUrl: matchedImg, stockTotal, stockColors, inventory: stockItems };
      });
      
      setPhones(updatedPhones);
      
      try {
        const now = new Date(); localStorage.setItem('samsung_dealer_data', JSON.stringify(updatedPhones)); localStorage.setItem('samsung_dealer_sync_time', now.toISOString());
        const prevNotice = localStorage.getItem('samsung_dealer_notice'); let nDate = localStorage.getItem('samsung_dealer_notice_date');
        if (noticeResult.message && noticeResult.message !== prevNotice) { nDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); localStorage.setItem('samsung_dealer_notice_date', nDate); }
        localStorage.setItem('samsung_dealer_notice', noticeResult.message); localStorage.setItem('samsung_dealer_custom_btns', JSON.stringify(noticeResult.buttons));
        if (fDate) { localStorage.setItem('samsung_dealer_sheet_date', fDate); setSheetDate(fDate); }
        setNoticeMsg(noticeResult.message); if (nDate) setNoticeDate(nDate); setCustomButtons(noticeResult.buttons); setIsOutdated(false);
      } catch(e) {}
    } catch (err) { 
      if (!isBackground) { showToast("Sync failed. Check internet."); } 
    } finally { 
      if (!isBackground) setLoading(false); 
      setIsRefreshing(false);
    }
  }, [showToast, isOutletAllowed, refreshAuth]);

  useEffect(() => {
    let hasCache = false;
    try {
      const data = localStorage.getItem('samsung_dealer_data'); const time = localStorage.getItem('samsung_dealer_sync_time');
      const date = localStorage.getItem('samsung_dealer_sheet_date'); const btns = localStorage.getItem('samsung_dealer_custom_btns');
      const nDate = localStorage.getItem('samsung_dealer_notice_date');
      if (data) {
        const parsed = JSON.parse(data); if (Array.isArray(parsed)) { setPhones(parsed); hasCache = true; }
        if (time) { const t = new Date(time); setIsOutdated((new Date() - t) / (1000 * 60 * 60) > 24); }
        if (date) setSheetDate(date); if (btns) setCustomButtons(JSON.parse(btns)); if (nDate) setNoticeDate(nDate);
      }
    } catch(e) {}
    fetchAllData(hasCache);
  }, [fetchAllData]);

  useEffect(() => {
    const syncInterval = setInterval(() => { if (navigator.onLine) fetchAllData(true); }, 120000);
    return () => clearInterval(syncInterval);
  }, [fetchAllData]);

  const displayPhones = useMemo(() => {
    let filtered = phones.filter(p => {
      if (showOnlyInStock && (p.stockTotal || 0) === 0) return false;
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (searchQuery.trim() === '') return true;
      const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const searchableString = `${p.model} ${p.modelCode}`.toLowerCase();
      return queryTerms.every(term => searchableString.includes(term));
    });
    if (sortBy === 'low') filtered = [...filtered].sort((a, b) => (a.effNum || a.mopNum) - (b.effNum || b.mopNum));
    else if (sortBy === 'high') filtered = [...filtered].sort((a, b) => (b.effNum || b.mopNum) - (a.effNum || a.mopNum));
    return filtered;
  }, [phones, searchQuery, activeCategory, sortBy, showOnlyInStock]);

  const handleToggleExpand = useCallback((id) => { setExpandedId(prev => prev === id ? null : id); setCopyStatus(null); }, []);
  const handleToggleCompare = useCallback((phone) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === phone.id)) { if (prev.length === 1 && showCompareModal) setShowCompareModal(false); return prev.filter(p => p.id !== phone.id); }
      if (prev.length >= 3) { showToast("Max 3 models allowed for comparison."); return prev; }
      return [...prev, phone];
    });
  }, [showToast, showCompareModal]);
  
  const clearCompare = useCallback(() => { setCompareList([]); setShowCompareModal(false); }, []);

  const shareCompareWhatsApp = useCallback(() => {
    if (compareList.length === 0) return; let txt = `📊 *SAMSUNG GALAXY COMPARE*\n\n`;
    compareList.forEach((p, i) => {
      const sName = splitModelName(p.model); txt += `📱 *${sName.main}* ${sName.sub ? `_${sName.sub}_` : ''}\n💰 MOP: *${p.mop}*\n`;
      if (isValidDiscount(p.sellOut)) txt += `🏷️ Sellout: ${p.sellOut}\n`; if (isValidDiscount(p.upgrade)) txt += `🔄 Upgrade: ${p.upgrade}\n`;
      if (isValidDiscount(p.bank)) txt += `💳 Bank: ${p.bank}\n`; if (isValidDiscount(p.specialUpgrade)) txt += `⚡ Special: ${p.specialUpgrade}\n`;
      txt += `🔥 *Effective Price: ${p.effectivePrice}*\n`; if (i < compareList.length - 1) txt += `------------------------\n`;
    });
    if (storeName && storeName.trim()) txt += `\n📍 *Visit at:* ${storeName.trim()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  }, [compareList, storeName]);

  const generateShareText = useCallback((phone) => {
    const sName = splitModelName(phone.model); let txt = `📱 *${sName.main}*\n`; if (sName.sub) txt += `   _${sName.sub}_\n`; txt += `\nMOP: *${phone.mop}*\n`;
    if (isValidDiscount(phone.sellOut)) { const p = splitAmountAndDesc(phone.sellOut); txt += `🏷️ Sellout: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    const hasUpg = isValidDiscount(phone.upgrade); const hasBank = isValidDiscount(phone.bank); const isCombo = isComboOffer(phone.specialUpgrade);
    if (hasUpg) { const p = splitAmountAndDesc(phone.upgrade); txt += `🔄 Upgrade: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    if (hasUpg && hasBank && !isCombo) { txt += `   *--- OR ---*\n`; }
    if (hasBank) { const p = splitAmountAndDesc(phone.bank); txt += `💳 Bank: - ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    if (isValidDiscount(phone.specialUpgrade)) { const p = splitAmountAndDesc(phone.specialUpgrade); txt += `⚡ Special: ${formatSafePrice(p.amount)}\n`; if(p.desc) txt += `   ↳ _(${p.desc})_\n`; }
    if (phone.gift) txt += `🎁 *Gift:* ${phone.gift}\n`; if (phone.remarks) txt += `📝 *Note:* ${phone.remarks}\n`;
    txt += `\n🔥 *Effective Price: ${phone.effectivePrice}*\n\n`; if (storeName && storeName.trim()) txt += `📍 *Visit at:* ${storeName.trim()}\n`;
    txt += `\n*(Note: Prices subject to change. Verify before finalizing.)*`; return txt;
  }, [storeName]);

  const handleCopy = useCallback((phone) => {
    const txt = generateShareText(phone); const el = document.createElement("textarea"); el.value = txt; el.style.position = 'fixed'; el.style.top = '0'; el.style.left = '0'; el.style.opacity = '0';
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand('copy'); setCopyStatus(phone.id); setTimeout(() => setCopyStatus(null), 2000); showToast("Copied to clipboard!"); } 
    catch (e) { showToast("Failed to copy. Feature not supported."); } document.body.removeChild(el);
  }, [generateShareText, showToast]);

  const handleWhatsApp = useCallback((phone) => { window.open(`https://wa.me/?text=${encodeURIComponent(generateShareText(phone))}`, '_blank'); }, [generateShareText]);
  const handleOpenTemplateModal = useCallback((phone) => setTemplateModalPhone(phone), []);
  const handleOpenCalculator = useCallback((phone) => setCalculatorData(phone), []);
  const handleGenerateImageWrapper = async (phone, templateId) => { setTemplateModalPhone(null); setIsGeneratingImg(phone.id); try { await generatePosterImage(phone, templateId, storeName); } catch (e) { showToast("Poster generation failed."); } finally { setIsGeneratingImg(null); } };

  const categories = ['All', ...SHEET_TABS.map(t => t.name)];
  const gridColsClass = compareList.length === 1 ? 'grid-cols-2' : compareList.length === 2 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="w-full relative pb-24">
      {calculatorData !== null && <NlcCalculator onClose={() => setCalculatorData(null)} initialData={calculatorData} showToast={showToast} />}
      {cheaperStockModalData !== null && <CheaperStockModal data={cheaperStockModalData} onClose={() => setCheaperStockModalData(null)} />}

      {compareList.length > 0 && !showCompareModal && calculatorData === null && (
        <div className="fixed bottom-20 inset-x-0 z-[80] flex justify-center px-4 animate-fade-in pointer-events-none">
          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3.5 flex items-center justify-between gap-4 w-full max-w-sm pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {compareList.map(p => (
                  <div key={p.id} className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-[9px] font-bold overflow-hidden shadow-sm">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt=""/> : (p.modelCode || '').substring(0,2)}
                  </div>
                ))}
              </div>
              <span className="text-[12px] font-extrabold text-slate-700 leading-tight">{compareList.length}/3</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearCompare} className="text-[12px] font-bold text-gray-500 px-4 py-2.5 rounded-[18px] bg-gray-100 hover:bg-gray-200">Clear</button>
              <button onClick={() => setShowCompareModal(true)} className="bg-black text-white px-4 py-2.5 rounded-[18px] text-[12px] font-bold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-800">Compare <ArrowRight size={14}/></button>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && calculatorData === null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center sm:p-4 bg-[#F2F4F7] sm:bg-black/40 sm:backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F2F4F7] w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden animate-fade-in-up border border-white/50">
            <div className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-white/50 px-5 py-4 flex justify-between items-center z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2"><Layers size={20} className="text-black"/> Compare</h2>
              <div className="flex items-center gap-2">
                <button onClick={shareCompareWhatsApp} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-[14px] transition-colors"><MessageCircle size={20}/></button>
                <button onClick={() => setShowCompareModal(false)} className="p-2.5 bg-gray-100 rounded-[14px] text-gray-600 hover:bg-gray-200 transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 hide-scrollbar">
              <div className="bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden w-full">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="min-w-[300px]">
                    <div className={`grid ${gridColsClass} gap-1.5 bg-gray-50/50 p-2 border-b border-gray-100`}>
                      <div className="flex items-end justify-center text-[10px] font-bold text-gray-400 uppercase pb-2">Specs</div>
                      {compareList.map(p => (
                        <div key={p.id} className="flex flex-col items-center text-center gap-2 p-1 relative pt-2">
                          <button onClick={() => handleToggleCompare(p)} className="absolute top-0 right-0 sm:right-2 bg-gray-100 text-gray-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors z-10"><X size={12}/></button>
                          <div className="w-[60px] h-[60px] bg-white rounded-[16px] border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                            {p.imageUrl ? <img src={p.imageUrl} loading="lazy" decoding="async" className={`w-full h-full object-contain mix-blend-multiply animate-fade-in ${p.category === 'Tab Series' || p.category === 'Gear Bud' ? 'scale-100 p-1' : 'scale-[1.25]'}`} alt=""/> : <CustomSamsungIcon className="text-gray-300" size={24}/>}
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-extrabold text-slate-900 leading-tight break-words px-1 text-balance">{splitModelName(p.model).main}</span>
                        </div>
                      ))}
                    </div>

                    {[
                      { label: 'MOP', key: 'mop', color: 'text-slate-900 font-bold' },
                      { label: 'Effective', key: 'effectivePrice', color: 'text-black font-black bg-gray-100/50 rounded-[12px]' },
                      { label: 'Upgrade', key: 'upgrade', color: 'text-gray-700 font-semibold' },
                      { label: 'Bank', key: 'bank', color: 'text-gray-700 font-semibold' },
                      { label: 'Sellout', key: 'sellOut', color: 'text-gray-700 font-semibold' },
                      { label: 'Special', key: 'specialUpgrade', color: 'text-gray-700 font-semibold' }
                    ].map((row) => (
                      <div key={row.label} className={`grid ${gridColsClass} gap-1.5 border-b border-gray-100 last:border-0 py-3 items-stretch`}>
                        <div className="flex items-center justify-center text-[11px] font-bold text-gray-500 uppercase text-center px-1">{row.label}</div>
                        {compareList.map(p => (
                          <div key={p.id} className={`flex items-center justify-center text-center text-[12px] break-words px-1 py-1 ${row.color}`}>
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

      {templateModalPhone && calculatorData === null && (
        <PosterTemplateModal phone={templateModalPhone} onGenerate={handleGenerateImageWrapper} onClose={() => setTemplateModalPhone(null)} />
      )}

      {isOutdated && calculatorData === null && (
        <div className="bg-red-50 text-red-600 px-4 py-3 flex items-center justify-between text-[12px] font-bold sticky top-0 z-40 border-b border-red-100">
          <div className="flex items-center gap-1.5"><AlertCircle size={16} /><span>Data might be outdated.</span></div>
          <button onClick={() => fetchAllData(false)} className="bg-white px-3 py-1.5 rounded-[12px] text-red-700 hover:bg-red-50 shadow-sm">Refresh</button>
        </div>
      )}

      <header className={`bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${isOutdated ? 'sticky top-[45px] z-30' : 'sticky top-0 z-30'}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <SamAssistIcon size={36} className="rounded-[12px] shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-[16px] sm:text-[18px] font-extrabold leading-none text-slate-900 tracking-tight">SamAssist</h1>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{userName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {hasNlcAccess && (
                <button onClick={() => setCalculatorData({})} className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 text-black rounded-[12px] sm:rounded-[14px] flex items-center justify-center shadow-sm hover:bg-gray-200 transition-colors">
                  <Calculator size={18} strokeWidth={2.5} />
                </button>
              )}
              
              <button onClick={() => fetchAllData(false)} className="w-9 h-9 sm:w-10 sm:h-10 bg-white text-gray-600 border border-gray-100 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shadow-sm relative hover:bg-gray-50 transition-colors">
                {isRefreshing && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>}
                <RefreshCw size={16} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white rounded-[12px] sm:rounded-[14px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-gray-800 transition-colors">
                <Menu size={18} />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-4 top-[65px] w-64 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/80 bg-white/90 backdrop-blur-xl z-50 animate-fade-in origin-top-right overflow-hidden">
                    <a href={WA_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-4 flex items-center gap-3 bg-[#F0FDF4]/80 border-b border-gray-100 hover:bg-[#dcfce7]">
                      <div className="bg-green-500 text-white p-2 rounded-[12px]"><MessageCircle size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-green-600 uppercase">Community</span><span className="text-[13px] font-black text-slate-900">WhatsApp Group</span></div>
                    </a>
                    <div className="px-4 py-4 border-b border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Store Name</label>
                      <input type="text" value={storeName} onChange={(e) => { setStoreName(e.target.value); localStorage.setItem('samassist_store_name', e.target.value); }} placeholder="Enter Store Name" className="w-full text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-[14px] px-3 py-2.5 outline-none focus:border-black focus:bg-white transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" />
                    </div>
                    <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-[12px]"><Calendar size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase">Sheet Date</span><span className="text-[13px] font-bold text-slate-800">{sheetDate || 'N/A'}</span></div>
                    </div>
                    <a href="https://youtube.com/@MabArena" target="_blank" rel="noopener noreferrer" className="px-4 py-4 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="bg-red-50 text-red-600 p-2 rounded-[12px]"><Youtube size={16} /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase">Developer</span><span className="text-[13px] font-bold text-slate-800">Mab Arena</span></div>
                    </a>
                    <button onClick={handleLogout} className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors">
                      <div className="bg-gray-100 text-gray-600 p-2 rounded-[12px]"><LogIn size={16} className="rotate-180" /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase">Account</span><span className="text-[13px] font-bold text-red-600">Logout User</span></div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /></div>
            <input 
              type="text" placeholder="Search models or codes..." 
              className="w-full bg-white border border-gray-200 text-slate-900 focus:border-black focus:ring-1 focus:ring-black w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-[16px] sm:rounded-[20px] text-[16px] sm:text-[15px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.02)] outline-none transition-all" 
              value={searchInput} 
              onChange={(e) => { setSearchInput(e.target.value); if (e.target.value.trim() !== '') setActiveCategory('All'); }} 
            />
          </div>

          <div className="flex items-center relative">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 items-center w-full pb-1">
              {/* Compact Sort Pill */}
              <div className="relative shrink-0">
                <select 
                  value={sortBy} onChange={(e) => setSortBy(e.target.value)} 
                  className={`appearance-none pl-3 pr-7 py-2 rounded-full text-[11.5px] font-bold border outline-none transition-colors shadow-sm ${sortBy !== 'none' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <option value="none">Sort: A-Z</option>
                  <option value="low">Price: Low</option>
                  <option value="high">Price: High</option>
                </select>
                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${sortBy !== 'none' ? 'text-white/70' : 'text-slate-400'}`} size={12} strokeWidth={3} />
              </div>

              {/* Compact In Stock Pill - Hidden if NO stock access */}
              {stockAccess !== 'NO' && (
                <>
                  <button 
                    onClick={() => setShowOnlyInStock(!showOnlyInStock)} 
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11.5px] font-bold border transition-colors shadow-sm ${showOnlyInStock ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    <Box size={13} strokeWidth={3} /> {showOnlyInStock ? 'Stock Only' : 'In Stock'}
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-0.5 shrink-0"></div>
                </>
              )}

              {/* Compact Category Pills */}
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-[11.5px] font-bold border transition-colors shadow-sm ${activeCategory === category ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{category}</button>
              ))}
              
              {customButtons.length > 0 && <div className="w-px h-4 bg-slate-200 mx-0.5 shrink-0"></div>}
              {customButtons.map((btn, idx) => (
                <button key={`custom-btn-${idx}`} onClick={() => setIframeData({ url: btn.url, title: btn.name })} className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-[11.5px] font-bold border transition-colors bg-white text-slate-800 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm">
                  {btn.name} <ArrowRight size={12} strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-5 relative">
        {loading && phones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="text-gray-400 h-8 w-8 animate-spin mb-4" />
            <p className="font-bold text-[13px] text-gray-500">Syncing Prices & Data...</p>
          </div>
        ) : (
          <>
            {noticeMsg && (
              <div className="mb-4 sm:mb-5 relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white animate-fade-in overflow-hidden bg-white/80 backdrop-blur-md">
                <div className="bg-gradient-to-br from-gray-100 to-white shadow-[inset_0_2px_0_rgba(255,255,255,1),0_4px_10px_rgba(0,0,0,0.05)] p-2.5 sm:p-3 rounded-[14px] sm:rounded-[18px] shrink-0 border border-gray-100">
                  <MessageCircle className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] text-black" />
                </div>
                <div className="flex flex-col w-full z-10 pt-0.5 sm:pt-1">
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2 w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-black">
                        Notice
                      </span>
                    </div>
                    {noticeDate && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-[6px] sm:rounded-[8px]">
                        {noticeDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] sm:text-[14px] font-semibold text-slate-800 leading-snug sm:leading-relaxed whitespace-pre-wrap">{noticeMsg}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {displayPhones.length > 0 ? (
                displayPhones.map((phone) => (
                  <PhoneCard 
                    key={phone.id} phone={phone} isExpanded={expandedId === phone.id} isSelectedForCompare={!!compareList.find(p => p.id === phone.id)}
                    onToggleExpand={handleToggleExpand} onToggleCompare={handleToggleCompare} onCopy={handleCopy} copyStatus={copyStatus}
                    onWhatsApp={handleWhatsApp} onGenerateImage={handleOpenTemplateModal} isGenerating={isGeneratingImg} onOpenCalc={handleOpenCalculator}
                    hasNlcAccess={hasNlcAccess} hasDpAccess={hasDpAccess}
                    hasLowerDpAccess={hasLowerDpAccess}
                    onOpenCheaperStock={setCheaperStockModalData}
                  />
                ))
              ) : (
                <div className="bg-white py-16 px-4 text-center rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100">
                  <Search className="text-gray-300 h-12 w-12 mx-auto mb-3" />
                  <h3 className="text-[15px] font-extrabold text-slate-900">No Models Found</h3>
                </div>
              )}
            </div>

            {displayPhones.length > 0 && (
              <div className="mt-10 mb-4 bg-transparent border border-gray-200 rounded-[28px] p-6 text-center">
                <ShieldAlert size={22} className="text-gray-400 mx-auto mb-3" />
                <p className="text-[13px] font-extrabold text-slate-700 mb-1">Data for reference purposes only.</p>
                <p className="text-[12px] text-gray-500 mb-2 leading-relaxed">Read scheme details carefully or contact sales team.</p>
                <p className="text-[11px] font-bold text-red-500/80">We are not liable for discrepancies.</p>
              </div>
            )}
          </>
        )}
      </main>

      {iframeData && (
        <div className="fixed inset-0 z-[400] bg-[#F2F4F7] flex flex-col animate-fade-in">
          <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 px-4 py-3.5 flex items-center justify-between z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
            <button onClick={() => setIframeData(null)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-[14px] text-slate-800 transition-colors font-bold text-[13px]">
              <ChevronLeft size={18} strokeWidth={3} /> Back
            </button>
            <h2 className="text-[15px] font-extrabold text-slate-900 truncate px-4 flex-1 text-center">{iframeData.title}</h2>
            <button onClick={() => setIframeData(null)} className="p-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-[14px] text-gray-600 transition-colors">
              <X size={18} strokeWidth={3} />
            </button>
          </div>
          <div className="flex-1 relative w-full h-full bg-[#F2F4F7]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <RefreshCw className="text-gray-300 h-8 w-8 animate-spin" />
            </div>
            <iframe src={iframeData.url} className="absolute inset-0 w-full h-full border-none z-10 bg-transparent" title={iframeData.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
          </div>
        </div>
      )}
      
      {showScroll && (
        <button onClick={scrollTop} className="bg-black text-white fixed bottom-20 right-6 p-4 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] z-50 flex items-center justify-center hover:bg-gray-800 hover:-translate-y-1 transition-all">
          <ArrowUp size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
});

// ==========================================
// STOCK MODULE COMPONENTS (Samsung Stock)
// ==========================================
const StockDetails = memo(({ items = [], onAction, isPrivacyMode, stockAccess }) => {
  const sortedItems = [...items].sort((a, b) => (b.age || 0) - (a.age || 0));
  const showSensitive = !isPrivacyMode;

  return (
    <div className="space-y-1.5 animate-fade-in">
      {sortedItems.map((item, idx) => {
        const isActivated = item.gmcsDate && item.gmcsDate !== '0' && item.gmcsDate.toUpperCase() !== 'NA';
        return (
          <div key={idx} className={`relative group rounded-[14px] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border transition-all duration-300 ${
            (isActivated && showSensitive) 
              ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-100/60 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.15)]' 
              : 'bg-white border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
          }`}>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 w-full overflow-hidden mb-0.5">
                <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black bg-blue-50/80 text-blue-600 border border-blue-100/50 uppercase shrink-0 select-text cursor-text tracking-wider">{item.pCode}</span>
                <span className="text-[13px] font-black text-slate-900 tracking-wider select-text cursor-text leading-none shrink-0">{item.imei || 'NO IMEI'}</span>
                <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-slate-100 text-slate-600 capitalize shrink truncate">{item.color || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-medium text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 text-slate-700 font-bold shrink-0"><MapPin size={10} className="text-slate-400" /> {item.outlet}</span>
                <span className="flex items-center gap-1 shrink-0"><Calendar size={10} className="text-slate-400" /> {item.date || 'No Date'}</span>
                {(isActivated && showSensitive) && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black bg-emerald-100/80 text-emerald-700 uppercase shrink-0 border border-emerald-200/50">
                    <ShieldCheck size={9} /> Sold: {item.gmcsDate}
                  </span>
                )}
                {(showSensitive && item.netLending && item.netLending !== 'N/A') && (
                  <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50/80 px-1.5 py-0.5 rounded-[4px] shrink-0 text-[9px]">
                    <Clock size={9}/> Lend: {formatPrice(item.netLending)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 mt-1 sm:mt-0 border-t border-slate-100/60 sm:border-0">
              {stockAccess === 'FULL' && (
                <div className="flex gap-1 bg-slate-100/70 p-0.5 rounded-full flex-1 sm:flex-none border border-slate-200/60 shadow-inner">
                  <button onClick={(e) => { e.stopPropagation(); onAction('transfer', item); }} className="flex-1 sm:px-4 flex items-center justify-center gap-1 text-slate-600 hover:text-slate-900 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-95 hover:bg-white hover:shadow-sm">
                    <ArrowRightLeft size={11} strokeWidth={3} /> Move
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onAction('sell', item); }} className="flex-1 sm:px-4 flex items-center justify-center gap-1 bg-slate-900 text-white py-1.5 rounded-full text-[10px] font-black transition-all active:scale-95 shadow-sm">
                    <ShoppingCart size={11} strokeWidth={2.5} /> Sell
                  </button>
                </div>
              )}
              {item.age >= 0 && (
                <div className={`shrink-0 flex flex-col items-center justify-center min-w-[36px] h-[36px] rounded-[10px] shadow-sm border ${item.age > 60 ? 'bg-rose-50 border-rose-100 text-rose-700' : item.age > 30 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  <span className="text-[12px] font-black leading-none">{item.age}</span>
                  <span className="text-[6px] font-bold uppercase mt-0.5 opacity-70 leading-none tracking-widest">Days</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

const ModelCard = memo(({ modelName, data, onAction, isPrivacyMode, stockAccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorSummary = useMemo(() => {
    if (!data?.items) return {};
    return data.items.reduce((acc, item) => {
      const c = item.color || 'Unknown';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
  }, [data?.items]);

  if (!data?.items?.length) return null;

  const renderModelName = (name) => {
    const splitIndex = name.indexOf('(');
    if (splitIndex !== -1) {
      const base = name.substring(0, splitIndex).trim();
      const variant = name.substring(splitIndex).trim();
      return (<>{base} <span className="text-[11px] font-bold text-slate-400 ml-1 tracking-tight">{variant}</span></>);
    }
    return name;
  };

  return (
    <div className={`bg-white rounded-[20px] transition-all duration-300 relative overflow-hidden border ${isExpanded ? 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-slate-200 z-10 scale-[1.01]' : 'shadow-sm border-slate-100 hover:shadow-md'}`}>
      <div onClick={() => setIsExpanded(!isExpanded)} className="px-3.5 py-3 flex flex-col gap-2 cursor-pointer">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
               <span className="text-[14px] font-black text-emerald-700">{data.total}</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
               <h3 className="text-[15px] font-black text-slate-900 leading-tight truncate">{renderModelName(modelName)}</h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total In Stock</span>
            </div>
          </div>
          <div className="flex items-center shrink-0">
             <div className={`w-8 h-8 rounded-[12px] flex items-center justify-center transition-all duration-300 ease-out ${isExpanded ? 'rotate-180 bg-black text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
               <ChevronDown size={18} strokeWidth={3} />
             </div>
          </div>
        </div>
        
        {/* Color Summary Line */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1 pb-0.5">
          {Object.entries(colorSummary).map(([color, count]) => (
            <div key={color} className="flex items-center bg-[#F8F9FA] border border-gray-100 rounded-[8px] pl-2 pr-1.5 py-1.5 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
              <span className="text-[10px] font-bold text-slate-600 capitalize tracking-tight truncate max-w-[80px]">{color}</span>
              <span className="ml-1.5 bg-white text-slate-800 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-[6px] text-[9px] font-black border border-gray-200 shadow-sm">{count}</span>
            </div>
          ))}
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 animate-fade-in origin-top">
          <div className="bg-slate-50/70 rounded-[16px] p-2.5 border border-slate-100/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)]">
            <StockDetails items={data.items} onAction={onAction} isPrivacyMode={isPrivacyMode} stockAccess={stockAccess} />
          </div>
        </div>
      )}
    </div>
  );
});

const StockView = memo(({ showToast, stockAccess, allowedOutlets, refreshAuth }) => {
  const [inventory, setInventory] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); const [selectedOutlet, setSelectedOutlet] = useState('YS'); const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', item: null }); const [actionLoading, setActionLoading] = useState(false);
  const [newOutlet, setNewOutlet] = useState(''); const [addForm, setAddForm] = useState({ pCode: '', mName: '', color: '', imei: '', dp: '', mop: '', outlet: 'YS', date: new Date().toISOString().split('T')[0] });
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]); const [isScanning, setIsScanning] = useState(false);
  const [pCodeSuggestions, setPCodeSuggestions] = useState([]); const [showSuggestions, setShowSuggestions] = useState(false);

  const videoRef = useRef(null); const scannerInterval = useRef(null);

  const isOutletAllowed = useCallback((outlet) => {
    if (!allowedOutlets || allowedOutlets === 'NONE') return false; 
    if (allowedOutlets === 'ALL') return true;
    const allowedArr = allowedOutlets.split(',').map(s => s.trim().toUpperCase());
    return allowedArr.includes(outlet.toUpperCase());
  }, [allowedOutlets]);

  const fetchInventory = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    
    // Auto sync permissions in background
    if (refreshAuth) await refreshAuth();

    try {
      const res = await fetch(INVENTORY_CSV_URL); const text = await res.text(); const rows = csvToArray(text);
      if (rows.length < 2) throw new Error("Empty data");
      const parsedData = rows.slice(1).filter(r => r && r.length >= 8).map(row => {
        const availableStr = String(row[7] || '').trim().toUpperCase();
        if (!availableStr || ['0', 'NO', 'FALSE', 'SOLD'].includes(availableStr)) return null;
        let outletName = ['YES', 'TRUE', 'MAIN STORE', 'YS'].includes(availableStr) ? 'YS' : availableStr;
        // Don't filter out by outlet here if they have 'FULL' or 'VIEW' access. They should see ALL outlets in STOCK TAB.
        // The requirement said: "SAMSUNG STOCK TAB ME SABHI OUTLET KA STOCK DIKHE"
        return {
          pCode: String(row[0] || '').trim().toUpperCase(), mName: String(row[1] || '').trim().toUpperCase(), color: toTitleCase(String(row[2] || '').trim()), 
          imei: String(row[3] || '').trim().toUpperCase(), date: String(row[4] || '').trim(), dp: String(row[5] || '').trim(), mop: String(row[6] || '').trim(),
          outlet: outletName, gmcsDate: row[8] ? String(row[8]).trim() : '', netLending: row[9] ? String(row[9]).trim() : '', age: calculateStockAge(String(row[4] || '').trim())
        };
      }).filter(Boolean);
      setInventory(parsedData); setError('');
    } catch { setError("Connection Error. Checking again soon."); } finally { if (!isSilent) setLoading(false); }
  };

  useEffect(() => {
    fetchInventory(); const interval = setInterval(() => { fetchInventory(true); }, 120000); return () => clearInterval(interval);
  }, []);

  const uniquePCodes = useMemo(() => { const codes = new Map(); inventory.forEach(item => { if (item.pCode) codes.set(item.pCode, item); }); return Array.from(codes.values()); }, [inventory]);
  const searchFilteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory; const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    return inventory.filter(item => { const searchableText = `${item.pCode} ${item.mName} ${item.color} ${item.imei} ${item.gmcsDate}`.toLowerCase(); return terms.every(term => searchableText.includes(term)); });
  }, [inventory, searchQuery]);
  const outletStats = useMemo(() => { const stats = { 'ALL': searchFilteredInventory.length }; searchFilteredInventory.forEach(item => { stats[item.outlet] = (stats[item.outlet] || 0) + 1; }); return stats; }, [searchFilteredInventory]);
  const tabs = useMemo(() => {
    const counts = {}; inventory.forEach(item => counts[item.outlet] = (counts[item.outlet] || 0) + 1);
    const others = Object.keys(counts).filter(o => o !== 'YS' && o !== 'ALL').sort((a, b) => counts[b] - counts[a]); return ['ALL', 'YS', ...others];
  }, [inventory]);

  const openModal = (type, item = null) => {
    setModalConfig({ isOpen: true, type, item }); setNewOutlet(item ? item.outlet : ''); setSaleDate(new Date().toISOString().split('T')[0]);
    if (type === 'add') { setAddForm({ pCode: '', mName: '', color: '', imei: '', dp: '', mop: '', outlet: 'YS', date: new Date().toISOString().split('T')[0] }); setPCodeSuggestions([]); setShowSuggestions(false); }
  };
  const closeModal = () => { if (actionLoading) return; setModalConfig({ isOpen: false, type: '', item: null }); setIsScanning(false); };

  const exportReport = (type) => {
    let baseData = searchFilteredInventory; let reportData = (type === 'rebill') ? baseData.filter(item => item.age >= 85) : [...baseData];
    if (reportData.length === 0) return showToast("Data not found to export");
    const headers = ["PCode", "Model", "Color", "IMEI", "ArrivalDate", "Outlet", "Age", "Lending", "Sold_Date"];
    const rows = reportData.map(item => [item.pCode, item.mName, item.color, item.imei, item.date, item.outlet, item.age, item.netLending, item.gmcsDate]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
      let fileName = type === 'rebill' ? 'Rebill_Report' : 'Full_Inventory'; if (searchQuery.trim()) { fileName = `Search_Export_${searchQuery.trim().replace(/\s+/g, '_')}`; }
      link.setAttribute("download", `${fileName}_${new Date().toLocaleDateString()}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showToast("Report Exported Successfully!"); closeModal();
    } catch (e) { showToast("Download failed"); }
  };

  const handlePCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length > 0) { const filtered = uniquePCodes.filter(item => item.pCode.includes(val)).slice(0, 5); setPCodeSuggestions(filtered); setShowSuggestions(true); } else setShowSuggestions(false);
    setAddForm(prev => { const match = uniquePCodes.find(item => item.pCode === val); if (match) return { ...prev, pCode: val, mName: match.mName, color: match.color, dp: match.dp, mop: match.mop }; return { ...prev, pCode: val }; });
  };
  const selectSuggestion = (item) => { setAddForm(prev => ({...prev, pCode: item.pCode, mName: item.mName, color: item.color, dp: item.dp, mop: item.mop })); setShowSuggestions(false); };

  useEffect(() => {
    let stream;
    if (isScanning && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
          stream = s; if(videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.setAttribute("playsinline", true); videoRef.current.play(); }
          if (window.BarcodeDetector) {
            const detector = new window.BarcodeDetector(); 
            scannerInterval.current = setInterval(async () => {
              try {
                if(videoRef.current && videoRef.current.readyState === 4) {
                   const barcodes = await detector.detect(videoRef.current).catch(() => []);
                   if (barcodes.length > 0) { const cleanImei = barcodes[0].rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); if (cleanImei) { setAddForm(prev => ({...prev, imei: cleanImei})); setIsScanning(false); } }
                }
              } catch (e) {}
            }, 500);
          } else { showToast("Browser scanner not supported"); setIsScanning(false); }
        }).catch(() => { showToast("Camera access required"); setIsScanning(false); });
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); if (scannerInterval.current) clearInterval(scannerInterval.current); };
  }, [isScanning, showToast]);

  const submitAction = async (payload) => {
    setActionLoading(true); closeModal(); showToast("Updating sheet...");
    try {
      const res = await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if(result.status === 'success') { showToast("Success!"); fetchInventory(true); } else alert("Failed: " + result.message);
    } catch { alert("Network Error. Try again."); } finally { setActionLoading(false); }
  };

  const handleConfirmAction = () => {
    const { type, item } = modalConfig;
    if (type === 'sell' && item) { submitAction({ action: 'sell', imei: item.imei, soldDate: formatDateForSheet(saleDate) }); }
    else if (type === 'transfer' && item) { if(!newOutlet) return showToast("Select destination"); submitAction({ action: 'transfer', imei: item.imei, newOutlet }); }
    else if (type === 'add') {
      if(!addForm.imei || !addForm.pCode) return showToast("Missing details");
      if(inventory.some(it => it.imei.toUpperCase() === addForm.imei.toUpperCase())) return showToast("Duplicate IMEI!");
      const finalForm = { ...addForm, color: toTitleCase(addForm.color), date: formatDateForSheet(addForm.date) };
      submitAction({ action: 'add', data: finalForm });
    }
  };

  const processedData = useMemo(() => {
    let filtered = searchFilteredInventory; if (selectedOutlet !== 'ALL') filtered = filtered.filter(item => item.outlet === selectedOutlet);
    const grouped = filtered.reduce((acc, item) => { const key = item.mName || 'UNKNOWN MODEL'; if (!acc[key]) acc[key] = { mName: key, total: 0, items: [] }; acc[key].total += 1; acc[key].items.push(item); return acc; }, {});
    return Object.values(grouped).sort((a, b) => a.mName.localeCompare(b.mName));
  }, [searchFilteredInventory, selectedOutlet]);

  return (
    <div className="w-full relative pb-28 min-h-screen">
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F2F4F7] rounded-t-[32px] sm:rounded-[32px] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-white/50 max-h-[90vh] animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-white/50 bg-white/80 backdrop-blur-lg shrink-0">
              <h3 className="text-[17px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter shrink-0">{modalConfig.type === 'sell' ? 'Confirm Sale' : modalConfig.type === 'transfer' ? 'Move Stock' : modalConfig.type === 'add' ? 'Add Item' : 'Reports'}</h3>
              <button onClick={closeModal} className="p-2 bg-gray-100 text-slate-500 rounded-full hover:bg-black hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              {modalConfig.type === 'export' && (
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => exportReport('all')} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[24px] hover:bg-slate-50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-4"><div className="bg-gray-100 p-3 rounded-[16px] text-slate-900"><FileText size={24}/></div><div className="text-left"><span className="font-black block leading-none">{searchQuery.trim() ? "Export Search" : "Full Inventory"}</span><p className="text-[10px] font-bold uppercase mt-1 opacity-60 truncate max-w-[120px]">{searchQuery.trim() ? `Search: ${searchQuery}` : "All Outlets Data"}</p></div></div><Download size={20}/>
                  </button>
                  <button onClick={() => exportReport('rebill')} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[24px] hover:bg-slate-50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-4"><div className="bg-gray-100 p-3 rounded-[16px] text-rose-600"><History size={24}/></div><div className="text-left"><span className="font-black block leading-none text-[15px]">Rebill Report</span><p className="text-[10px] font-bold uppercase mt-1 opacity-60">85+ days old stock</p></div></div><Download size={20}/>
                  </button>
                </div>
              )}
              {modalConfig.type === 'sell' && modalConfig.item && (
                <div className="space-y-5 py-2 pb-10">
                  <div className="bg-emerald-50 p-4 rounded-[20px] border border-emerald-100 text-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><ShoppingCart size={24} className="text-emerald-500" /></div>
                    <p className="text-[15px] font-black text-emerald-900 leading-tight mb-1 truncate">{modalConfig.item.mName}</p>
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">{modalConfig.item.imei}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase ml-1 text-slate-500 flex items-center gap-2"><Calendar size={14}/> Select Sale Date</label>
                    <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[16px] font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm" />
                  </div>
                </div>
              )}
              {modalConfig.type === 'transfer' && modalConfig.item && (
                <div className="space-y-4 pb-10">
                   <div className="bg-white p-4 rounded-[20px] border border-gray-200 shadow-sm mb-2"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-black truncate leading-tight">Move Item: {modalConfig.item.mName}</p><p className="text-[11px] font-bold text-slate-500">Current Outlet: <span className="text-black">{modalConfig.item.outlet}</span></p></div>
                   <div className="grid grid-cols-2 gap-3">{tabs.filter(t => t !== 'ALL' && t !== modalConfig.item.outlet).map(out => (<button key={out} onClick={() => setNewOutlet(out)} className={`p-4 rounded-[20px] text-[12px] font-black border transition-all truncate ${newOutlet === out ? 'bg-black text-white border-black shadow-[0_8px_20px_rgba(0,0,0,0.15)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'}`}>{out}</button>))}</div>
                   <input type="text" placeholder="ENTER OUTLET" value={newOutlet} onChange={(e) => setNewOutlet(e.target.value.toUpperCase())} className="w-full bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[15px] font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all uppercase shadow-sm mt-2" />
                </div>
              )}
              {modalConfig.type === 'add' && (
                <div className="space-y-4 relative pb-20"> 
                  <div className="relative">
                    <input type="text" placeholder="PRODUCT CODE" value={addForm.pCode} onChange={handlePCodeChange} onFocus={() => addForm.pCode.length > 0 && setShowSuggestions(true)} className="w-full bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[14px] font-bold uppercase outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
                    {showSuggestions && pCodeSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-[60] mt-2 bg-white border border-gray-200 rounded-[20px] shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                        {pCodeSuggestions.map((item, idx) => (
                          <button key={idx} onClick={() => selectSuggestion(item)} className="w-full flex flex-col items-start px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-none transition-colors text-left"><span className="text-[13px] font-black text-slate-900 uppercase">{item.pCode}</span><span className="text-[10px] font-bold text-gray-500 uppercase truncate w-full">{item.mName} | {item.color}</span></button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="text" placeholder="MODEL NAME *" value={addForm.mName} onChange={e => setAddForm({...addForm, mName: e.target.value})} className="w-full bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[14px] font-bold uppercase outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="COLOR" value={addForm.color} onChange={e => setAddForm({...addForm, color: e.target.value})} className="bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[14px] font-bold capitalize outline-none focus:border-black shadow-sm" />
                    <input type="date" value={addForm.date} onChange={(e) => setAddForm({...addForm, date: e.target.value})} className="bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[13px] font-bold outline-none focus:border-black shadow-sm" />
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="IMEI *" value={addForm.imei} onChange={e => setAddForm({...addForm, imei: e.target.value.toUpperCase()})} className={`flex-1 bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[15px] font-black uppercase outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm`} />
                    <button onClick={() => setIsScanning(!isScanning)} className="px-5 rounded-[20px] bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95"><ScanLine size={20} /></button>
                  </div>
                  {isScanning && (
                    <div className="h-48 bg-black rounded-[24px] overflow-hidden border border-slate-700 animate-fade-in relative shadow-inner">
                      <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 border-2 border-emerald-500/50 m-6 rounded-[16px] animate-pulse pointer-events-none flex items-center justify-center">
                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-widest bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm">Scanning</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="DP" value={addForm.dp} onChange={e => setAddForm({...addForm, dp: e.target.value})} className="bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[14px] font-bold outline-none focus:border-black shadow-sm" />
                    <input type="number" placeholder="MOP" value={addForm.mop} onChange={e => setAddForm({...addForm, mop: e.target.value})} className="bg-white border border-gray-200 rounded-[20px] px-4 py-4 text-[14px] font-bold outline-none focus:border-black shadow-sm" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-white/50 flex gap-3 bg-white/80 backdrop-blur-lg shrink-0 pb-safe sm:pb-5">
              <button onClick={closeModal} className="flex-1 py-4 rounded-[24px] font-black text-[14px] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">CANCEL</button>
              <button onClick={handleConfirmAction} className="flex-1 py-4 rounded-[24px] font-black text-[14px] text-white bg-black shadow-[0_8px_24px_rgba(0,0,0,0.2)] active:scale-95 transition-transform">CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h1 className="text-[16px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <StockIcon size={36} className="rounded-[12px] shrink-0" />
              <div className="flex flex-col">
                 <span className="leading-none">Samsung Stock</span>
                 <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Inventory</span>
              </div>
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {stockAccess === 'FULL' && (
                <>
                  <button onClick={() => openModal('export')} className="w-9 h-9 sm:w-10 sm:h-10 bg-white text-gray-600 rounded-[12px] sm:rounded-[14px] border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"><Download size={18} /></button>
                  <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-[12px] sm:rounded-[14px] border transition-all shadow-sm ${isPrivacyMode ? 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50' : 'bg-black text-white border-black shadow-[0_4px_10px_rgba(0,0,0,0.2)]'}`}>{isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </>
              )}
              <button onClick={() => fetchInventory()} disabled={loading} className="w-9 h-9 sm:w-10 sm:h-10 bg-white text-gray-600 rounded-[12px] sm:rounded-[14px] border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"><RefreshCw size={18} className={loading ? "animate-spin text-emerald-600" : ""} /></button>
            </div>
          </div>
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input type="text" placeholder="Search imei, model..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 text-slate-900 rounded-[16px] sm:rounded-[20px] py-3 sm:py-3.5 pl-11 pr-4 text-[15px] font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]" />
          </div>
          <div className="flex items-center relative">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 items-center w-full pb-1">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setSelectedOutlet(tab)} className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full text-[11.5px] font-bold transition-all border shadow-sm uppercase tracking-tight ${selectedOutlet === tab ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{tab} <span className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-black ${selectedOutlet === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{outletStats[tab] || 0}</span></button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3.5 sm:space-y-4 relative">
        {loading && inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse"><RefreshCw className="text-gray-400 h-8 w-8 animate-spin mb-4" /><p className="font-bold text-[13px] text-gray-500 uppercase tracking-widest">Updating Database...</p></div>
        ) : (
          <>
            <div className="flex justify-between items-center px-1 min-h-[30px] gap-2 mb-1">
              <p className="text-[12px] font-extrabold text-gray-400 uppercase tracking-widest truncate">{selectedOutlet} RESULTS</p>
              <div className="text-right shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Stock</span>
                <span className="text-[20px] font-black text-black leading-none tracking-tighter">{processedData.reduce((sum, g) => sum + g.total, 0)}</span>
              </div>
            </div>
            {processedData.length > 0 ? processedData.map((group) => <ModelCard key={group.mName} modelName={group.mName} data={group} onAction={(t, i) => openModal(t, i)} isPrivacyMode={isPrivacyMode} stockAccess={stockAccess} />) : (
              <div className="bg-white py-16 px-4 text-center rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 animate-fade-in"><Box className="text-gray-300 h-12 w-12 mx-auto mb-3" /><h3 className="text-[15px] font-extrabold text-slate-900 uppercase">STOCK NOT FOUND</h3></div>
            )}
          </>
        )}
      </main>

      {stockAccess === 'FULL' && (
        <button onClick={() => openModal('add')} className="fixed bottom-24 right-6 z-40 bg-black text-white rounded-[24px] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-transform"><Plus size={28} strokeWidth={3} /></button>
      )}
    </div>
  );
});

// ==========================================
// AUTH & INSTALL COMPONENTS
// ==========================================
const InstallPrompt = ({ onContinue }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showFallbackMsg, setShowFallbackMsg] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { setDeferredPrompt(null); onContinue(); }
    } else {
      setShowFallbackMsg(true); setTimeout(() => setShowFallbackMsg(false), 5000);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#F2F4F7] text-slate-900 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-gray-200/50 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="flex-1 flex flex-col items-center justify-center p-5 z-10 w-full max-w-[400px] mx-auto">
        <div className="w-full animate-fade-in-up flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-[24px] flex items-center justify-center mb-5 shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
             <IndianRupee size={36} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight mb-1 text-center">
            SamAssist <span className="text-gray-500">Pro</span>
          </h1>
          <p className="text-gray-500 text-[13px] font-medium text-center px-4 mb-8 leading-relaxed">
            Install the app for lightning-fast access, offline support, and a seamless native feel.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-gray-100 text-black flex items-center justify-center shrink-0"><Zap size={18} /></div>
              <div className="flex flex-col"><span className="font-bold text-[13px] text-slate-900 leading-tight">Instant</span><span className="text-[11px] text-gray-500 leading-tight mt-0.5">Zero wait</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><WifiOff size={18} /></div>
              <div className="flex flex-col"><span className="font-bold text-[13px] text-slate-900 leading-tight">Offline</span><span className="text-[11px] text-gray-500 leading-tight mt-0.5">Works anywhere</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Maximize size={18} /></div>
              <div className="flex flex-col"><span className="font-bold text-[13px] text-slate-900 leading-tight">Immersive</span><span className="text-[11px] text-gray-500 leading-tight mt-0.5">Full screen</span></div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Home size={18} /></div>
              <div className="flex flex-col"><span className="font-bold text-[13px] text-slate-900 leading-tight">1-Tap</span><span className="text-[11px] text-gray-500 leading-tight mt-0.5">Home access</span></div>
            </div>
          </div>
          {showFallbackMsg && (
            <div className="mb-4 w-full bg-gray-100 text-gray-800 text-[12px] font-medium p-3 rounded-[20px] animate-fade-in flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0 text-gray-600" />
              <p>Tap menu (⋮) & select <b className="text-black">"Add to Home screen"</b>.</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 pb-8 z-20 w-full max-w-[400px] mx-auto mt-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <button onClick={handleInstallClick} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-[24px] flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] mb-3">
          <Download size={18} /> Install Application
        </button>
        <button onClick={onContinue} className="w-full text-gray-500 hover:text-black font-bold py-3 text-[13px] flex items-center justify-center gap-2 transition-all rounded-[20px]">
          Skip & Continue
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
    const handleOnline = () => setIsOffline(false); const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isOffline) { setError("Internet connection is required."); return; }
    const cleanMobile = mobile.replace(/\D/g, ''); 
    if (cleanMobile.length < 10) { setError("Enter valid 10-digit number"); return; }
    if (pin.trim().length < 4) { setError("Enter secret PIN (min 4 digits)"); return; }

    const inputLast10 = cleanMobile.slice(-10); const inputPin = pin.trim();
    setLoading(true); setError(''); setShowRequestBtn(false);

    try {
      const res = await fetch(AUTH_SHEET_URL);
      if (!res.ok) throw new Error("Connection failed");
      const csvText = await res.text();
      if (csvText.includes('<!doctype html>')) throw new Error("Invalid Auth Data.");

      const rows = csvToArray(csvText);
      let isAuthorized = false; let userName = "User"; let hasNlcAccess = false; let hasDpAccess = false;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2) {
          const col0 = String(row[0] || "").trim(); const col1 = String(row[1] || "").trim();
          const col2 = String(row[2] || "").trim(); const col3 = String(row[3] || "").trim().toUpperCase();
          const col4 = String(row[4] || "").trim().toUpperCase();
          const mobileFromCol0 = col0.replace(/\D/g, '').slice(-10);
          const mobileFromCol1 = col1.replace(/\D/g, '').slice(-10);

          if ((mobileFromCol0 === inputLast10 || mobileFromCol1 === inputLast10) && inputLast10.length === 10 && col2 === inputPin) {
            isAuthorized = true;
            userName = (mobileFromCol0 === inputLast10) ? (col1 || "Dealer") : (col0 || "Dealer");
            hasNlcAccess = (col3 === "YES"); hasDpAccess = (col4 === "YES"); 
            
            let sAccess = String(row[5] || "").trim().toUpperCase(); 
            if (!sAccess) sAccess = "NO"; 
            
            let aOutlets = String(row[6] || "").trim().toUpperCase(); 
            if (!aOutlets) aOutlets = "NONE"; 
            
            let lowerDpAcc = String(row[7] || "").trim().toUpperCase(); 
            if (!lowerDpAcc) lowerDpAcc = "NO"; 

            localStorage.setItem('samsung_dealer_stock_access', sAccess);
            localStorage.setItem('samsung_dealer_allowed_outlets', aOutlets);
            localStorage.setItem('samsung_dealer_lower_dp_access', lowerDpAcc);

            onLoginSuccess(userName, hasNlcAccess, hasDpAccess, sAccess, aOutlets, lowerDpAcc === 'YES');
            break;
          }
        }
      }

      if (isAuthorized) {
        localStorage.setItem('samsung_dealer_auth', inputLast10); localStorage.setItem('samsung_dealer_name', userName);
        localStorage.setItem('samsung_dealer_nlc_access', hasNlcAccess ? 'YES' : 'NO');
        localStorage.setItem('samsung_dealer_dp_access', hasDpAccess ? 'YES' : 'NO');
      } else {
        setError("Access Denied! Incorrect details."); setShowRequestBtn(true);
      }
    } catch (err) { setError(err.message || "Failed. Try again."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col font-sans relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-5 z-10 w-full max-w-[420px] mx-auto">
        <div className="w-full bg-white/60 backdrop-blur-3xl border border-white rounded-[36px] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)] animate-fade-in-up">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-[20px] flex items-center justify-center mb-5 shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
               <IndianRupee size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-tight">Welcome</h1>
            <p className="text-gray-500 text-[13px] font-medium mt-1">Sign in to your authorized account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                </div>
                <input 
                  type="tel" placeholder="Mobile Number" value={mobile}
                  onChange={(e) => { setMobile(e.target.value); setError(''); setShowRequestBtn(false); }}
                  className="w-full bg-white border border-gray-200 text-slate-900 rounded-[16px] sm:rounded-[20px] py-3.5 sm:py-4 pl-11 sm:pl-12 pr-4 text-[16px] sm:text-[15px] font-bold placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  maxLength="15"
                />
              </div>
            </div>
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                </div>
                <input 
                  type={showPin ? "text" : "password"} inputMode="numeric" pattern="[0-9]*" placeholder="Secret PIN" value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); setShowRequestBtn(false); }}
                  className="w-full bg-white border border-gray-200 text-slate-900 rounded-[16px] sm:rounded-[20px] py-3.5 sm:py-4 pl-11 sm:pl-12 pr-12 text-[16px] sm:text-[15px] tracking-widest font-extrabold placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  maxLength="8"
                />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors">
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-3.5 rounded-[16px] flex items-start gap-2.5 animate-fade-in border border-red-100">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-[12px] font-semibold leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" disabled={loading || mobile.replace(/\D/g, '').length < 10 || pin.trim().length < 4 || isOffline}
              className="w-full bg-black hover:bg-gray-800 disabled:opacity-60 disabled:hover:bg-black text-white font-bold py-4 rounded-[20px] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2.5 mt-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : (isOffline ? <WifiOff size={18} /> : <LogIn size={18} />)}
              {loading ? 'Verifying...' : (isOffline ? 'Offline - Check Connection' : 'Sign In')}
            </button>

            {showRequestBtn && (
              <button type="button" onClick={() => window.open(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Admin, I would like to request access for SamAssist Pro.\nMy Mobile Number is: ${mobile}\nPlease provide me the secret PIN.`)}`, '_blank')} className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold py-3.5 rounded-[20px] transition-all flex items-center justify-center gap-2.5 mt-3 animate-fade-in">
                <MessageCircle size={18} className="text-green-600" /> Request Access
              </button>
            )}
          </form>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <ShieldAlert size={12} /> Secured Area
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT (Router & Auth)
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('samsung_dealer_auth'));
  const [showInstallPrompt, setShowInstallPrompt] = useState(() => !localStorage.getItem('samassist_skip_install'));
  const [userName, setUserName] = useState(() => localStorage.getItem('samsung_dealer_name') || 'Dealer');
  const [hasNlcAccess, setHasNlcAccess] = useState(() => localStorage.getItem('samsung_dealer_nlc_access') === 'YES');
  const [hasDpAccess, setHasDpAccess] = useState(() => localStorage.getItem('samsung_dealer_dp_access') === 'YES');
  
  const [stockAccess, setStockAccess] = useState(() => localStorage.getItem('samsung_dealer_stock_access') || 'NO');
  const [allowedOutlets, setAllowedOutlets] = useState(() => localStorage.getItem('samsung_dealer_allowed_outlets') || 'NONE');
  const [hasLowerDpAccess, setHasLowerDpAccess] = useState(() => localStorage.getItem('samsung_dealer_lower_dp_access') === 'YES');

  const [activeTab, setActiveTab] = useState('offers');
  const [toastMsg, setToastMsg] = useState('');
  
  const showToast = useCallback((msg) => { 
    setToastMsg(typeof msg === 'string' ? msg : String(msg)); 
    setTimeout(() => setToastMsg(''), 3000); 
  }, []);

  useEffect(() => {
    let meta = document.querySelector("meta[name='viewport']");
    if (!meta) { meta = document.createElement('meta'); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover";

    let noSelectStyle = document.getElementById('samassist-noselect');
    if (!noSelectStyle) {
      noSelectStyle = document.createElement('style'); noSelectStyle.id = 'samassist-noselect';
      noSelectStyle.innerHTML = `
        * { -webkit-tap-highlight-color: transparent; font-family: 'Inter', system-ui, sans-serif; }
        body { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
        input, textarea, select { -webkit-user-select: auto; user-select: auto; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `;
      document.head.appendChild(noSelectStyle);
    }
  }, []);

  // Sync Permissions Dynamically
  const refreshAuth = useCallback(async () => {
    const mobile = localStorage.getItem('samsung_dealer_auth');
    if (!mobile) return;
    try {
      const res = await fetch(AUTH_SHEET_URL);
      const csvText = await res.text();
      const rows = csvToArray(csvText);
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2) {
           const col0 = String(row[0] || "").trim().replace(/\D/g, '').slice(-10);
           const col1 = String(row[1] || "").trim().replace(/\D/g, '').slice(-10);
           if ((col0 === mobile && mobile.length === 10) || (col1 === mobile && mobile.length === 10)) {
              const nlc = String(row[3] || "").trim().toUpperCase() === "YES";
              const dp = String(row[4] || "").trim().toUpperCase() === "YES";
              let sAcc = String(row[5] || "").trim().toUpperCase(); if (!sAcc) sAcc = "NO";
              let aOut = String(row[6] || "").trim().toUpperCase(); if (!aOut) aOut = "NONE";
              let lowDp = String(row[7] || "").trim().toUpperCase() === "YES";

              setHasNlcAccess(nlc); setHasDpAccess(dp);
              setStockAccess(sAcc); setAllowedOutlets(aOut); setHasLowerDpAccess(lowDp);

              localStorage.setItem('samsung_dealer_nlc_access', nlc ? 'YES' : 'NO');
              localStorage.setItem('samsung_dealer_dp_access', dp ? 'YES' : 'NO');
              localStorage.setItem('samsung_dealer_stock_access', sAcc);
              localStorage.setItem('samsung_dealer_allowed_outlets', aOut);
              localStorage.setItem('samsung_dealer_lower_dp_access', lowDp ? 'YES' : 'NO');
              break;
           }
        }
      }
    } catch (e) {}
  }, []);

  const handleLoginSuccess = (name, nlcAccess, dpAccess, sAccess, aOutlets, lowerDpAcc) => {
    setUserName(name); setHasNlcAccess(nlcAccess); setHasDpAccess(dpAccess); 
    setStockAccess(sAccess); setAllowedOutlets(aOutlets); setHasLowerDpAccess(lowerDpAcc);
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    localStorage.removeItem('samsung_dealer_auth'); localStorage.removeItem('samsung_dealer_name');
    localStorage.removeItem('samsung_dealer_nlc_access'); localStorage.removeItem('samsung_dealer_dp_access');
    localStorage.removeItem('samsung_dealer_stock_access'); localStorage.removeItem('samsung_dealer_allowed_outlets');
    localStorage.removeItem('samsung_dealer_lower_dp_access');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    if (showInstallPrompt) return <InstallPrompt onContinue={() => { localStorage.setItem('samassist_skip_install', 'true'); setShowInstallPrompt(false); }} />;
    return <SecurityLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F2F4F7] relative overflow-hidden text-slate-900 selection:bg-gray-200">
      {toastMsg && (
        <div className="fixed top-6 left-0 right-0 z-[500] flex justify-center pointer-events-none px-4">
          <div className="bg-black text-white px-5 py-3 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-[13px] font-bold flex items-center justify-center gap-2 animate-fade-in-up border border-white/10 pointer-events-auto">
            <CheckCircle size={16} className="text-emerald-400" /> {toastMsg}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar bg-[#F2F4F7]">
        {activeTab === 'offers' ? (
          <OffersView userName={userName} hasNlcAccess={hasNlcAccess} hasDpAccess={hasDpAccess} allowedOutlets={allowedOutlets} hasLowerDpAccess={hasLowerDpAccess} stockAccess={stockAccess} handleLogout={handleLogout} showToast={showToast} refreshAuth={refreshAuth} />
        ) : (
          <StockView showToast={showToast} stockAccess={stockAccess} allowedOutlets={allowedOutlets} refreshAuth={refreshAuth} />
        )}
      </div>

      {/* Dark Glassmorphism Bottom Nav (Match Image 21445.jpg) */}
      <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4 pb-safe">
        <div className="relative flex items-center p-2 bg-[#0B1724]/80 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] rounded-full w-[220px] pointer-events-auto">
          
          {stockAccess !== 'NO' && (
            <div 
              className="absolute top-2 bottom-2 w-[calc(50%-16px)] bg-white/20 backdrop-blur-md rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ 
                transform: activeTab === 'offers' ? 'translateX(0)' : 'translateX(calc(100% + 16px))',
                left: '8px' 
              }}
            ></div>
          )}

          {/* Tab 1: Offers */}
          <button 
            onClick={() => setActiveTab('offers')} 
            className="relative z-10 flex-1 flex items-center justify-center py-3.5 rounded-full transition-colors duration-300 cursor-pointer"
          >
            <Home size={22} strokeWidth={2.5} className={activeTab === 'offers' || stockAccess === 'NO' ? 'text-white' : 'text-white/40 hover:text-white/70'} />
          </button>
          
          {/* Tab 2: Inventory (Condition based on stockAccess) */}
          {stockAccess !== 'NO' && (
            <button 
              onClick={() => setActiveTab('stock')} 
              className="relative z-10 flex-1 flex items-center justify-center py-3.5 rounded-full transition-colors duration-300 cursor-pointer"
            >
              <Box size={22} strokeWidth={2.5} className={activeTab === 'stock' ? 'text-white' : 'text-white/40 hover:text-white/70'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
