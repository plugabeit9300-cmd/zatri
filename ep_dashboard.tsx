import { useState, useMemo, useRef } from "react";

const VENDORS_INFO = {
  "Waizdee":   { company:"Waizdee Trading Co.", website:"https://www.waizdee.com", email:"sales@waizdee.com", phone:null, country:"Asia / Online", notes:"Distributor for VIGOUR (Letlok) fittings, instrumentation, and SS310S tubing." },
  "Scope":     { company:"Scope Metal", website:"https://www.scope.co.il", email:"info@scope.co.il", phone:"+972-3-557-9911", country:"Israel", notes:"Local stainless steel stockist. DK-Lok compatible fittings, tubing, structural profiles, flanges, and fasteners." },
  "Technobar": { company:"Technobar Ltd.", website:"https://www.technobar.co.il", email:"info@technobar.co.il", phone:"+972-3-925-3838", country:"Israel", notes:"Authorised Ham-Let distributor for Israel." },
  "Emproco":   { company:"Emproco Ltd.", website:"https://www.emproco.co.il", email:"info@emproco.co.il", phone:null, country:"Israel", notes:"Authorised Alicat Scientific representative for Israel." },
};

const DOCUMENTS_INIT = [
  { id:"d1", title:"Waizdee Quote #PD20260116-1", manufacturer:"VIGOUR / Waizdee", type:"Quote", date:"2026-03-23", quoteRef:"Waizdee #PD20260116-1", catalogLink:null },
  { id:"d2", title:"Waizdee Instrumentation Items", manufacturer:"Waizdee", type:"Quote", date:"2026-04-06", quoteRef:"Waizdee (instrumentation items)", catalogLink:null },
  { id:"d3", title:"Waizdee SS310S Pipe Items", manufacturer:"Waizdee", type:"Quote", date:"2026-04-06", quoteRef:"Waizdee (pipe items)", catalogLink:null },
  { id:"d4", title:"Scope Quote #14509910", manufacturer:"Scope / DK-Lok compat.", type:"Quote", date:"2025-08-31", quoteRef:"Scope #14509910", catalogLink:null },
  { id:"d5", title:"Scope Quote #14606234", manufacturer:"Scope", type:"Quote", date:"2026-03-10", quoteRef:"Scope #14606234", catalogLink:null },
  { id:"d6", title:"Scope Quote #14618225", manufacturer:"Scope", type:"Quote", date:"2026-04-06", quoteRef:"Scope #14618225", catalogLink:null },
  { id:"d7", title:"Technobar / Ham-Let Quote #11148090", manufacturer:"Ham-Let", type:"Quote", date:"2026-04-06", quoteRef:"Technobar #11148090", catalogLink:"https://www.ham-let.com/resources/catalogs/" },
  { id:"d8", title:"Emproco / Alicat Quote #PQ260375", manufacturer:"Alicat Scientific", type:"Quote", date:"2026-04-06", quoteRef:"Emproco #PQ260375", catalogLink:"https://www.alicat.com/resource/alicat-product-catalog/" },
  { id:"d9", title:"Emproco Quote #PQ251876", manufacturer:"Edinburgh Instruments / Dynament", type:"Quote", date:"2025-12-03", quoteRef:"Emproco #PQ251876", catalogLink:null },
];

const PARTS_INIT = [
  {id:9,  partNumber:"SS-VC-04",    description:"Cap, Tube Fitting, 1/4\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:10.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:10, partNumber:"SS-VFF-04",   description:"Front Ferrule, Tube Fitting, 1/4\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:10.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:11, partNumber:"SS-VBF-04",   description:"Back Ferrule, Tube Fitting, 1/4\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:10.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:12, partNumber:"SS-VC-08",    description:"Cap, Tube Fitting, 1/2\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:16.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:13, partNumber:"SS-VFF-08",   description:"Front Ferrule, Tube Fitting, 1/2\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:16.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:14, partNumber:"SS-VBF-08",   description:"Back Ferrule, Tube Fitting, 1/2\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:16.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:15, partNumber:"SS-VAD-M4",   description:"Male Connector, 1/4\" NPT Male to 1/4\" Tube",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" NPT × 1/4\" tube",unitPrice:3.75,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:16, partNumber:"SS-VRU-04-02",description:"Reducing Union, 1/4\" to 1/8\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" × 1/8\" tube",unitPrice:10.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:17, partNumber:"SS-VUT-04",   description:"Union Tee, 1/4\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:21.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:18, partNumber:"SS-VUC-04",   description:"Union Cross, 1/4\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:34.38,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:19, partNumber:"SS-VMC-02-M4",description:"Male Connector, 1/4\" Letlok to 1/8\" NPT Male",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube × 1/8\" NPT",unitPrice:10.63,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:20, partNumber:"SS-VRU-08-04",description:"Reducing Union, 1/2\" to 1/4\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" × 1/4\" tube",unitPrice:16.88,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:21, partNumber:"SS-VUT-08",   description:"Union Tee, 1/2\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:36.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:22, partNumber:"SS-VUC-08",   description:"Union Cross, 1/2\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:60.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:23, partNumber:"SS-VP-08",    description:"Plug, 1/2\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:8.13,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:24, partNumber:"SS-VP-04",    description:"Plug, 1/4\" Tube OD, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:6.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:25, partNumber:"PTFE-VFF-02", description:"Front & Back Ferrule Set, 1/8\" Tube OD, PTFE",manufacturer:"VIGOUR",vendor:"Waizdee",material:"PTFE",connection:"1/8\" tube",unitPrice:2.75,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:false,tempRatingC:260,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:26, partNumber:"PTFE-VFF-04", description:"Front & Back Ferrule Set, 1/4\" Tube OD, PTFE",manufacturer:"VIGOUR",vendor:"Waizdee",material:"PTFE",connection:"1/4\" tube",unitPrice:2.25,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:false,tempRatingC:260,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:27, partNumber:"PTFE-VFF-08", description:"Front & Back Ferrule Set, 1/2\" Tube OD, PTFE",manufacturer:"VIGOUR",vendor:"Waizdee",material:"PTFE",connection:"1/2\" tube",unitPrice:2.85,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:false,tempRatingC:260,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:28, partNumber:"SS-VFF-02",   description:"Front & Back Ferrule Set, 1/8\" Tube OD, SS316",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/8\" tube",unitPrice:2.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:29, partNumber:"SS-VFF-04-B", description:"Front & Back Ferrule Set, 1/4\" Tube OD, SS316",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:1.88,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:30, partNumber:"SS-VFF-08-B", description:"Front & Back Ferrule Set, 1/2\" Tube OD, SS316",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:2.38,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:31, partNumber:"SS-VMC-12-M12",description:"Male Connector, 3/4\" Letlok to 3/4\" NPT Male",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"3/4\" tube × 3/4\" NPT",unitPrice:45.38,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:103,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:32, partNumber:"SS-VMC-08-M8",description:"Male Connector, 1/2\" Letlok to 1/2\" NPT Male",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube × 1/2\" NPT",unitPrice:18.13,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:33, partNumber:"SS-VAU-F4",   description:"Female NPT Union (Mufa), 1/4\" NPT",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" NPT female",unitPrice:3.13,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:34, partNumber:"SS-VAU-F8",   description:"Female NPT Union (Mufa), 1/2\" NPT",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" NPT female",unitPrice:5.00,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:35, partNumber:"SS-VAU-F12",  description:"Female NPT Union (Mufa), 3/4\" NPT",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"3/4\" NPT female",unitPrice:7.50,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:36, partNumber:"SS-VAU-F16",  description:"Female NPT Union (Mufa), 1\" NPT",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1\" NPT female",unitPrice:9.38,currency:"USD",status:"Quoted",leadTime:"1–2 weeks",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:37, partNumber:"SS-VNV1-08-08",description:"Needle Valve, 1/2\" Tube OD Both Ends, Letlok",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube × 1/2\" tube",unitPrice:62.50,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:345,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:38, partNumber:"VCV1-S-08-08",description:"Check Valve, 1/2\" Tube OD, Lowest Cracking Pressure",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:59.38,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:345,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:39, partNumber:"VCV1-S-04-04",description:"Check Valve, 1/4\" Tube OD, Lowest Cracking Pressure",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/4\" tube",unitPrice:41.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:40, partNumber:"VG20S-6B",    description:"Pressure Gauge, 0–5 barg, SS316L, 1/4\" NPT",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316L",connection:"1/4\" NPT",unitPrice:16.25,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:false,tempRatingC:100,pressureRatingBar:5,category:"Instrumentation & Sensors",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:41, partNumber:"SS-VSV2-25-08-08",description:"Pressure Relief Valve, 5 barg Set Pressure, 1/2\" Tube OD",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316",connection:"1/2\" tube",unitPrice:135.00,currency:"USD",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:5,category:"Fittings & Valves",quoteRef:"Waizdee #PD20260116-1",date:"2026-03-23",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:45, partNumber:"TC-K-SS-100MM",description:"Thermocouple Type K, SS Body, 100mm, 1/8\" Dia, Cable 1.5m, Rated 800°C",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS",connection:"1/8\" probe / flying leads",unitPrice:32.00,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:true,tempRatingC:800,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:46, partNumber:"TC-K-SS-300MM",description:"Thermocouple Type K, SS Body, 300mm, Dia 3mm, Cable 3m, Rated 1200°C",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS",connection:"3mm probe / flying leads",unitPrice:55.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:true,tempRatingC:1200,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:47, partNumber:"PT-0-10BAR",  description:"Pressure Transmitter, SS Body, 4–20mA, 1/4\" NPT, Range 0–10 barg",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS",connection:"1/4\" NPT",unitPrice:73.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:false,tempRatingC:85,pressureRatingBar:10,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:48, partNumber:"PT-0-25BAR",  description:"Pressure Transmitter, SS Body, 4–20mA, 1/4\" NPT, Range 0–25 barg",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS",connection:"1/4\" NPT",unitPrice:73.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:false,tempRatingC:85,pressureRatingBar:25,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:49, partNumber:"PT-0-100BAR", description:"Pressure Transmitter, SS Body, 4–20mA, 1/4\" NPT, Range 0–100 barg",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS",connection:"1/4\" NPT",unitPrice:73.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:false,tempRatingC:85,pressureRatingBar:100,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:50, partNumber:"VSR-1EL",     description:"Ammonia Regulator, VIGOR SS316L Body, 4-Port, 1/4\" NPT(F) Inlet",manufacturer:"VIGOUR",vendor:"Waizdee",material:"SS316L",connection:"1/4\" NPT female",unitPrice:122.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:false,tempRatingC:60,pressureRatingBar:100,category:"Instrumentation & Sensors",quoteRef:"Waizdee (instrumentation items)",date:"2026-04-06",catalogLink:"https://www.vigour-fitting.com",cadFile:null},
  {id:42, partNumber:"SS310S-1/2-PIPE",description:"Seamless Tube, SS310S, 1/2\" OD, Wall 1.65mm, 6000mm, ASTM A213",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS310S",connection:"OD 12.70mm / 1/2\"",unitPrice:27.00,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:true,tempRatingC:1050,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Waizdee (pipe items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:43, partNumber:"SS310S-3/4-PIPE",description:"Seamless Tube, SS310S, 3/4\" OD, Wall 2.11mm, 6000mm, ASTM A213",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS310S",connection:"OD 19.05mm / 3/4\"",unitPrice:36.00,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:true,tempRatingC:1050,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Waizdee (pipe items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:44, partNumber:"SS310S-1IN-PIPE",description:"Seamless Tube, SS310S, 1\" OD, Wall 2.41mm, 6000mm, ASTM A213",manufacturer:"Waizdee",vendor:"Waizdee",material:"SS310S",connection:"OD 25.40mm / 1\"",unitPrice:51.50,currency:"USD",status:"Quoted",leadTime:"—",tempRated300:true,tempRatingC:1050,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Waizdee (pipe items)",date:"2026-04-06",catalogLink:null,cadFile:null},
  {id:65, partNumber:"DU-4-S",      description:"Union, Tube-to-Tube, 1/4\" OD Both Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/4\" tube × 1/4\" tube",unitPrice:24.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:66, partNumber:"DU-8-S",      description:"Union, Tube-to-Tube, 1/2\" OD Both Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 1/2\" tube",unitPrice:55.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:67, partNumber:"DUR8-4-S",    description:"Reducing Union, 1/2\" to 1/4\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" × 1/4\" tube",unitPrice:61.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:68, partNumber:"DMC8-8N-S",   description:"Male Connector, 1/2\" Tube OD × 1/2\" NPT Male, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 1/2\" NPT",unitPrice:36.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:69, partNumber:"DMC12-12N-S", description:"Male Connector, 3/4\" Tube OD × 3/4\" NPT Male, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"3/4\" tube × 3/4\" NPT",unitPrice:57.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:103,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:70, partNumber:"DMC16-16N-S", description:"Male Connector, 1\" Tube OD × 1\" NPT Male, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1\" tube × 1\" NPT",unitPrice:91.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:86,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:71, partNumber:"DT-8-S",      description:"Union Tee, 1/2\" Tube OD All Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 1/2\" × 1/2\"",unitPrice:93.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:72, partNumber:"DT-16-S",     description:"Union Tee, 1\" Tube OD All Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1\" tube × 1\" × 1\"",unitPrice:325.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:86,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:73, partNumber:"DN-8-S",      description:"Nut, 1/2\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube",unitPrice:14.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:74, partNumber:"DN-4-S",      description:"Nut, 1/4\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/4\" tube",unitPrice:5.50,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:75, partNumber:"DFF-8-S",     description:"Front Ferrule, 1/2\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube",unitPrice:4.50,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:76, partNumber:"DFB-8-S",     description:"Back Ferrule, 1/2\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube",unitPrice:4.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:77, partNumber:"DX-4-S",      description:"Union Cross, 1/4\" Tube OD All Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/4\" tube × 4 ends",unitPrice:102.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:78, partNumber:"DX-8-S",      description:"Union Cross, 1/2\" Tube OD All Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 4 ends",unitPrice:163.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:79, partNumber:"DX-16-S",     description:"Union Cross, 1\" Tube OD All Ends, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1\" tube × 4 ends",unitPrice:246.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:86,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:80, partNumber:"DAM4-4N-S",   description:"Male Adapter, 1/4\" DK-Lok Port × 1/4\" NPT Male, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/4\" port × 1/4\" NPT",unitPrice:13.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:81, partNumber:"DAM8-8N-S",   description:"Male Adapter, 1/2\" DK-Lok Port × 1/2\" NPT Male, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" port × 1/2\" NPT",unitPrice:30.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:82, partNumber:"DTBF8-4N-S",  description:"Female Branch Tee, 1/2\" Tube Run × 1/4\" NPT Female Branch, DK-Lok, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 1/4\" NPT",unitPrice:122.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:83, partNumber:"DTBF8-8N-S",  description:"Female Branch Tee, 1/2\" Tube Run × 1/2\" NPT Female Branch, DK-Lok, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 1/2\" NPT",unitPrice:126.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:84, partNumber:"TUBE-316L-1/4",description:"Seamless Tube, SS316L, 1/4\" OD, Wall 0.89mm, Polished",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"1/4\" OD / 0.89mm wall",unitPrice:20.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:85, partNumber:"COUPLING-316-1/2-BSP",description:"Coupling (Mufa), SS316, 1/2\" BSP, #150",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"1/2\" BSP female",unitPrice:6.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:86, partNumber:"TUBE-316L-1/2",description:"Seamless Tube, SS316L, 1/2\" OD, Wall 0.89mm, Polished, 6.00m",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"1/2\" OD / 0.89mm wall",unitPrice:37.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:87, partNumber:"BUSHING-316-1/2X1/4",description:"Hex Bushing, SS316, 1/2\" to 1/4\" BSP, #150",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"1/2\" × 1/4\" BSP",unitPrice:3.60,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:88, partNumber:"PLUG-316-1/2-BSP",description:"Hex Head Plug, SS316, 1/2\" BSP, #150",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"1/2\" BSP",unitPrice:2.60,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Hardware & Gaskets",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:89, partNumber:"STRUT-CLAMP-1/2",description:"Pipe / Strut Clamp, Scopostrat, 1/2\" (20–25mm OD)",manufacturer:"Scope",vendor:"Scope",material:"—",connection:"Ø20–25mm",unitPrice:4.50,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:false,tempRatingC:null,pressureRatingBar:null,category:"Hardware & Gaskets",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:90, partNumber:"DMC8-12N-S",  description:"Male Connector, 1/2\" Tube OD × 3/4\" NPT Male, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube × 3/4\" NPT",unitPrice:39.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:91, partNumber:"BALL-VALVE-316-1/2",description:"Ball Valve, Instrument, Hex Body, SS316, 1/2\" Tube, Two-Ferrule, 1000 PSI",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"1/2\" tube",unitPrice:165.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:false,tempRatingC:200,pressureRatingBar:69,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:92, partNumber:"DP-8-S",      description:"Plug with Nut, 1/2\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/2\" tube",unitPrice:21.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:93, partNumber:"DP-4-S",      description:"Plug with Nut, 1/4\" Tube OD, DK-Lok Compatible, SS316",manufacturer:"DK-Lok compatible",vendor:"Scope",material:"SS316",connection:"1/4\" tube",unitPrice:12.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:248,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:null,cadFile:null},
  {id:94, partNumber:"BALL-VALVE-316-1/4",description:"Ball Valve, Instrument, Hex Body, SS316, 1/4\" Tube, Two-Ferrule, 1000 PSI",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"1/4\" tube",unitPrice:115.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:false,tempRatingC:200,pressureRatingBar:69,category:"Fittings & Valves",quoteRef:"Scope #14509910",date:"2025-08-31",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:59, partNumber:"SQ-S235-40X40X1.5",description:"Hollow Square Section, Carbon Steel S235, 40×40mm, Wall 1.5mm",manufacturer:"Scope",vendor:"Scope",material:"S235",connection:"40×40×1.5mm SQ",unitPrice:24.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:false,tempRatingC:300,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:60, partNumber:"SQ-316-40X40X1.5",description:"Square Profile, SS316, Polished, 40×40mm, Wall 1.5mm, 6.00m",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"40×40×1.5mm SQ",unitPrice:36.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:61, partNumber:"SHEET-316L-1.5MM",description:"SS Sheet, SS316L, 2B Finish, 1.5mm Thick, 1000×2000mm",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"Flat sheet / 1.5mm",unitPrice:520.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:62, partNumber:"SQ-304-40X40X3",description:"Square Profile, SS304, Polished, 40×40mm, Wall 3mm, 6.00m",manufacturer:"Scope",vendor:"Scope",material:"SS304",connection:"40×40×3mm SQ",unitPrice:50.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:63, partNumber:"ANGLE-304L-40X40X3",description:"Angle Section, SS304L, HRAP, 40×40×3mm, ASTM A-276",manufacturer:"Scope",vendor:"Scope",material:"SS304L",connection:"40×40×3mm L-section",unitPrice:26.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:64, partNumber:"RD-BAR-316L-8MM",description:"Round Bar, SS316L, 8.00mm Dia, H9 Tolerance",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"Ø8mm round",unitPrice:20.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14606234",date:"2026-03-10",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:51, partNumber:"PIPE-316L-8IN-SCH40",description:"Welded Pipe, SS316L, 8\" OD, SCH.40 Wall, 5.80–6.00m",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"8\" OD / SCH.40",unitPrice:839.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:15,category:"Piping & Tubing",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:52, partNumber:"SHEET-316L-4MM",description:"SS Sheet, SS316L, 2B Finish, 4mm Thick, 1000×2000mm",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"Flat sheet / 4mm",unitPrice:1290.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:53, partNumber:"FLANGE-316L-8IN-150RF",description:"Blind Flange, SS316L, 8\", Class 150 RF, ASTM A182",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"8\" / CL.150 RF",unitPrice:965.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:20,category:"Hardware & Gaskets",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:54, partNumber:"REDUCER-316L-8X2IN",description:"Concentric Reducer, SS316L, Welded, 8\" × 2\", SCH.10S",manufacturer:"Scope",vendor:"Scope",material:"SS316L",connection:"8\" × 2\" / SCH.10S",unitPrice:260.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Piping & Tubing",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:55, partNumber:"GASKET-PTFE-8IN-150",description:"Gasket, PTFE Envelope, 8\", Class 150#, Asbestos-Free, 3mm",manufacturer:"Scope",vendor:"Scope",material:"PTFE / Non-asbestos",connection:"8\" / CL.150",unitPrice:111.30,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:false,tempRatingC:260,pressureRatingBar:20,category:"Hardware & Gaskets",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:56, partNumber:"BOLT-316-M20X50",description:"Hex Head Bolt, SS316, DIN 933-4A, M20 × 50mm",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"M20 thread",unitPrice:6.00,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Hardware & Gaskets",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:57, partNumber:"NUT-316-M20",  description:"Hex Nut, SS316, DIN 934-4A, M20",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"M20 thread",unitPrice:2.80,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Hardware & Gaskets",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:58, partNumber:"WASHER-316-M20",description:"Flat Washer, SS316, DIN 125-4A, M20",manufacturer:"Scope",vendor:"Scope",material:"SS316",connection:"M20 thread",unitPrice:1.10,currency:"ILS",status:"Quoted",leadTime:"Ex stock",tempRated300:true,tempRatingC:400,pressureRatingBar:null,category:"Hardware & Gaskets",quoteRef:"Scope #14618225",date:"2026-04-06",catalogLink:"https://www.scope.co.il",cadFile:null},
  {id:1,  partNumber:"H-400-SS-L-1/2",description:"Pressure Gauge, 1/2\" Port, 1/3 PSI, Panel Mount, EP",manufacturer:"Ham-Let",vendor:"Technobar",material:"SS316",connection:"1/2\" BSP/NPT",unitPrice:339.00,currency:"ILS",status:"Quoted",leadTime:"12 weeks",tempRated300:false,tempRatingC:100,pressureRatingBar:1,category:"Instrumentation & Sensors",quoteRef:"Technobar #11148090",date:"2026-04-06",catalogLink:"https://www.ham-let.com",cadFile:null},
  {id:2,  partNumber:"H-400-SS-L-1/4",description:"Pressure Gauge, 1/4\" Port, 1/3 PSI, Panel Mount, EP",manufacturer:"Ham-Let",vendor:"Technobar",material:"SS316",connection:"1/4\" BSP/NPT",unitPrice:158.20,currency:"ILS",status:"Quoted",leadTime:"12 weeks",tempRated300:false,tempRatingC:100,pressureRatingBar:1,category:"Instrumentation & Sensors",quoteRef:"Technobar #11148090",date:"2026-04-06",catalogLink:"https://www.ham-let.com",cadFile:null},
  {id:3,  partNumber:"H-99S-00-SS-L-V-1/2-PK",description:"Needle Valve, 1/2\" Port, Low Pressure, Compression End",manufacturer:"Ham-Let",vendor:"Technobar",material:"SS316",connection:"1/2\" tube/port",unitPrice:470.00,currency:"ILS",status:"Quoted",leadTime:"12 weeks",tempRated300:false,tempRatingC:150,pressureRatingBar:10,category:"Fittings & Valves",quoteRef:"Technobar #11148090",date:"2026-04-06",catalogLink:"https://www.ham-let.com",cadFile:null},
  {id:4,  partNumber:"F47W-6666ATG/BSPT",description:"Ball Valve, 1/2\" BSPT, Full Bore, SS316",manufacturer:"Ham-Let",vendor:"Technobar",material:"SS316",connection:"1/2\" BSPT",unitPrice:276.00,currency:"ILS",status:"Quoted",leadTime:"In stock",tempRated300:true,tempRatingC:400,pressureRatingBar:138,category:"Fittings & Valves",quoteRef:"Technobar #11148090",date:"2026-04-06",catalogLink:"https://www.ham-let.com",cadFile:null},
  {id:5,  partNumber:"H-700-SS-L-1/4-T-LD",description:"Tee Piece, 1/4\" Port, Low Dead Volume, Low Pressure",manufacturer:"Ham-Let",vendor:"Technobar",material:"SS316",connection:"1/4\" BSP/NPT",unitPrice:188.00,currency:"ILS",status:"Quoted",leadTime:"In stock",tempRated300:false,tempRatingC:150,pressureRatingBar:10,category:"Fittings & Valves",quoteRef:"Technobar #11148090",date:"2026-04-06",catalogLink:"https://www.ham-let.com",cadFile:null},
  {id:6,  partNumber:"ALIMC-5SLPM-CH4",description:"Mass Flow Controller, 5000 CCM, MC Series, Methane, RS-485, 24VDC",manufacturer:"Alicat Scientific",vendor:"Emproco",material:"—",connection:"RS-485 / 0–5V analog",unitPrice:8234.00,currency:"ILS",status:"Quoted",leadTime:"32 days",tempRated300:false,tempRatingC:50,pressureRatingBar:10,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ260375",date:"2026-04-06",catalogLink:"https://www.alicat.com",cadFile:null},
  {id:7,  partNumber:"ALIMC-5SLPM-H2",description:"Mass Flow Controller, 5000 CCM, MC Series, Hydrogen, RS-485, 24VDC",manufacturer:"Alicat Scientific",vendor:"Emproco",material:"—",connection:"RS-485 / 0–5V analog",unitPrice:8234.00,currency:"ILS",status:"Quoted",leadTime:"32 days",tempRated300:false,tempRatingC:50,pressureRatingBar:10,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ260375",date:"2026-04-06",catalogLink:"https://www.alicat.com",cadFile:null},
  {id:8,  partNumber:"ALIDC-61",    description:"Cable, Single Ended, 8-Pin Mini-DIN, 6 ft, Alicat MC Series",manufacturer:"Alicat Scientific",vendor:"Emproco",material:"—",connection:"8-pin mini-DIN",unitPrice:212.00,currency:"ILS",status:"Quoted",leadTime:"32 days",tempRated300:false,tempRatingC:null,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ260375",date:"2026-04-06",catalogLink:"https://www.alicat.com",cadFile:null},
  {id:95, partNumber:"EMP-2WGA-EDG-MA",description:"Gas Analyser System, CH4 & CO2, Edinburgh IR Sensors, 4–20mA, Metal Enclosure, 230VAC",manufacturer:"Edinburgh Instruments",vendor:"Emproco",material:"—",connection:"4–20mA analog / 230VAC",unitPrice:20650.00,currency:"ILS",status:"Quoted",leadTime:"35–45 working days",tempRated300:false,tempRatingC:null,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ251876",date:"2025-12-03",catalogLink:null,cadFile:null},
  {id:96, partNumber:"EMP-2WGA-DY-MS",description:"Gas Analyser System, CH4 & CO2, Dynament Mini-IR Sensors, Compact Cabinet, 230VAC",manufacturer:"Dynament",vendor:"Emproco",material:"—",connection:"4–20mA analog / 230VAC",unitPrice:12450.00,currency:"ILS",status:"Quoted",leadTime:"10–15 working days",tempRated300:false,tempRatingC:null,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ251876",date:"2025-12-03",catalogLink:null,cadFile:null},
  {id:97, partNumber:"RAE002-3022-000",description:"Water/Dust Replacement Filter, for EMP-2WGA Series Gas Analysers",manufacturer:"RAE Systems",vendor:"Emproco",material:"—",connection:"—",unitPrice:32.00,currency:"ILS",status:"Quoted",leadTime:"In stock",tempRated300:false,tempRatingC:null,pressureRatingBar:null,category:"Instrumentation & Sensors",quoteRef:"Emproco #PQ251876",date:"2025-12-03",catalogLink:null,cadFile:null},
];

const CAD_FOLDER_ROOT = "/CAD_Repository/ISI_RD/";
const CATEGORIES = ["All Parts","Fittings & Valves","Instrumentation & Sensors","Piping & Tubing","Hardware & Gaskets"];
const MAIN_TABS = ["Parts","Document Library","Maintenance"];
const VALID_CATEGORIES = ["Fittings & Valves","Instrumentation & Sensors","Piping & Tubing","Hardware & Gaskets"];
const fmtPrice = (p,c) => c==="ILS"?`₪${p.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:`$${p.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const isLongLead = lt => { if(!lt||["In stock","Ex stock","—"].includes(lt)) return false; const n=parseInt(lt); return !isNaN(n)&&lt.includes("week")&&n>=8; };

const MARKET_MAP = {
  "SS-VUT-04":{partType:"Union Tee, 1/4\" tube OD",standard:"ASTM A269 / ASTM F1387",alternatives:[{vendor:"Waizdee / VIGOUR",partNo:"SS-VUT-04",currency:"USD",price:21.25,leadTime:"In stock",ferrule:"Letlok (2-ferrule)",intermixable:false,functional:true},{vendor:"Scope / DK-Lok compat.",partNo:"DT-8-S (1/2\" ref only)",currency:"ILS",price:93.00,leadTime:"Ex stock",ferrule:"DK-Lok",intermixable:false,functional:true},{vendor:"Technobar / Ham-Let",partNo:"H-700 1/4\" Tee",currency:"ILS",price:188.00,leadTime:"In stock",ferrule:"Let-Lok",intermixable:true,functional:true}],notes:"VIGOUR Letlok and Ham-Let Let-Lok are both 2-ferrule compression. Ferrules are NOT cross-intermixable between brands."},
  "SS-VUT-08":{partType:"Union Tee, 1/2\" tube OD",standard:"ASTM A269 / ASTM F1387",alternatives:[{vendor:"Waizdee / VIGOUR",partNo:"SS-VUT-08",currency:"USD",price:36.25,leadTime:"In stock",ferrule:"Letlok",intermixable:false,functional:true},{vendor:"Scope / DK-Lok compat.",partNo:"DT-8-S",currency:"ILS",price:93.00,leadTime:"Ex stock",ferrule:"DK-Lok",intermixable:false,functional:true}],notes:"DK-Lok and Letlok share the same tube OD but different ferrule geometry."},
  "SS-VUC-04":{partType:"Union Cross, 1/4\" tube OD",standard:"ASTM A269",alternatives:[{vendor:"Waizdee / VIGOUR",partNo:"SS-VUC-04",currency:"USD",price:34.38,leadTime:"In stock",ferrule:"Letlok",intermixable:false,functional:true},{vendor:"Scope / DK-Lok compat.",partNo:"DX-4-S",currency:"ILS",price:102.00,leadTime:"Ex stock",ferrule:"DK-Lok",intermixable:false,functional:true}],notes:"Cross fittings require identical ferrule systems on all four ports."},
  "SS-VMC-08-M8":{partType:"Male Connector, 1/2\" tube × 1/2\" NPT",standard:"ASME B1.20.1",alternatives:[{vendor:"Waizdee / VIGOUR",partNo:"SS-VMC-08-M8",currency:"USD",price:18.13,leadTime:"In stock",ferrule:"Letlok",intermixable:false,functional:true},{vendor:"Scope / DK-Lok compat.",partNo:"DMC8-8N-S",currency:"ILS",price:36.00,leadTime:"Ex stock",ferrule:"DK-Lok",intermixable:false,functional:true}],notes:"NPT thread side is standardised — tube-end ferrule systems differ."},
  "H-99S-00-SS-L-V-1/2-PK":{partType:"Needle Valve, 1/2\" tube",standard:"—",alternatives:[{vendor:"Technobar / Ham-Let",partNo:"H-99S-00-SS-L-V-1/2-PK",currency:"ILS",price:470.00,leadTime:"12 weeks",ferrule:"Let-Lok",intermixable:true,functional:true},{vendor:"Waizdee / VIGOUR",partNo:"SS-VNV1-08-08",currency:"USD",price:62.50,leadTime:"In stock",ferrule:"Letlok",intermixable:false,functional:true}],notes:"Ham-Let H-99S is a specialist low-pressure needle valve. Verify Cv and seat design before substituting."},
  "F47W-6666ATG/BSPT":{partType:"Ball Valve, 1/2\" BSPT",standard:"—",alternatives:[{vendor:"Technobar / Ham-Let",partNo:"F47W-6666ATG/BSPT",currency:"ILS",price:276.00,leadTime:"In stock",ferrule:"BSPT threaded",intermixable:true,functional:true},{vendor:"Scope",partNo:"BALL-VALVE-316-1/2",currency:"ILS",price:165.00,leadTime:"Ex stock",ferrule:"Tube compression",intermixable:false,functional:true}],notes:"Ham-Let uses BSPT threaded ends; Scope uses 1/2\" tube ends. Not physically intermixable."},
};

const PARSE_SYSTEM_PROMPT = `You are a procurement data extraction assistant for an engineering company operating high-temperature process equipment (target 250–300°C service).

Extract all line items from the vendor quote and return ONLY a valid JSON array. Each object must conform exactly to this schema:
{
  "partNumber": "string — manufacturer exact part number",
  "description": "string — leads with functional name e.g. 'Ball Valve, 1/2\" BSPT, Full Bore, SS316'",
  "manufacturer": "string — OEM brand name",
  "vendor": "string — the company selling/quoting (from header)",
  "material": "string — e.g. SS316, PTFE, S235. Use '—' for electronics/cables",
  "connection": "string — port or connection type e.g. '1/4\" NPT'",
  "unitPrice": number,
  "currency": "ILS or USD",
  "status": "Quoted",
  "leadTime": "string — e.g. 'In stock', '4 weeks', '32 days'",
  "tempRated300": boolean,
  "tempRatingC": number or null,
  "pressureRatingBar": number or null,
  "category": "exactly one of: Fittings & Valves | Instrumentation & Sensors | Piping & Tubing | Hardware & Gaskets",
  "quoteRef": "string — vendor name + quote number e.g. 'Scope #14509910'",
  "date": "YYYY-MM-DD",
  "catalogLink": null,
  "cadFile": null
}

Rules:
- Never use "N/A" — use null for unknown fields
- tempRated300: true ONLY if explicitly rated ≥300°C in the quote/datasheet
- PTFE parts: always tempRated300: false, tempRatingC: 260
- Electronics/instruments: tempRated300: false, tempRatingC: null unless stated
- material must be "—" for cables and electronic instruments
- description must lead with functional name, never part number
- category must be exactly one of the four strings above
- cadFile is always null
- Return ONLY the JSON array, no markdown, no preamble`;

const VALIDATE_PARTS = (raw, nextId) => {
  const results = [], warnings = [];
  let id = nextId;
  for (const p of raw) {
    const w = [];
    if (!VALID_CATEGORIES.includes(p.category)) { p.category = "Instrumentation & Sensors"; w.push("category auto-corrected"); }
    if (typeof p.unitPrice !== "number") { p.unitPrice = parseFloat(p.unitPrice) || 0; w.push("price coerced"); }
    if (!["ILS","USD"].includes(p.currency)) { p.currency = "ILS"; w.push("currency defaulted to ILS"); }
    if (typeof p.tempRated300 !== "boolean") { p.tempRated300 = false; w.push("tempRated300 defaulted false"); }
    if (p.material && p.material.toUpperCase().includes("PTFE") && p.tempRated300) { p.tempRated300 = false; p.tempRatingC = 260; w.push("PTFE: tempRated300 forced false"); }
    if (p.tempRated300 && !p.tempRatingC) w.push("tempRated300=true but tempRatingC missing");
    p.id = id++;
    p.status = "Quoted";
    p.cadFile = null;
    if (w.length) warnings.push({ partNumber: p.partNumber, warnings: w });
    results.push(p);
  }
  return { parts: results, warnings };
};

export default function App() {
  const [parts, setParts] = useState(PARTS_INIT);
  const [documents, setDocuments] = useState(DOCUMENTS_INIT);
  const [mainTab, setMainTab] = useState("Parts");
  const [activeCategory, setActiveCategory] = useState("All Parts");
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All Vendors");
  const [minTemp, setMinTemp] = useState(0);
  const [showVendorDir, setShowVendorDir] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStep, setUploadStep] = useState("idle"); // idle | parsing | review | done
  const [uploadFile, setUploadFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsedParts, setParsedParts] = useState([]);
  const [parseWarnings, setParseWarnings] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [parseLog, setParseLog] = useState("");
  const [reviewChecked, setReviewChecked] = useState({});
  const fileRef = useRef();

  const vendors = useMemo(() => [...new Set(parts.map(p=>p.vendor))].sort(), [parts]);
  const unrated = parts.filter(p=>!p.tempRated300).length;
  const maintItems = useMemo(() => parts.filter(p => !p.catalogLink || !VENDORS_INFO[p.vendor]).map(p => ({
    id:p.id, partNumber:p.partNumber, description:p.description,
    issues:[...(!p.catalogLink?["Missing catalog link"]:[]),...(!VENDORS_INFO[p.vendor]?["Vendor info not on record"]:[])]
  })), [parts]);

  const filtered = useMemo(() => {
    let p = parts;
    if (activeCategory !== "All Parts") p = p.filter(x => x.category === activeCategory);
    if (vendorFilter !== "All Vendors") p = p.filter(x => x.vendor === vendorFilter);
    if (minTemp > 0) p = p.filter(x => x.tempRatingC != null && x.tempRatingC >= minTemp);
    if (search.trim()) { const q = search.toLowerCase(); p = p.filter(x => x.partNumber.toLowerCase().includes(q)||x.description.toLowerCase().includes(q)||x.manufacturer.toLowerCase().includes(q)||x.vendor.toLowerCase().includes(q)); }
    return p;
  }, [parts, activeCategory, vendorFilter, minTemp, search]);

  const catCounts = useMemo(() => {
    const c = {}; CATEGORIES.forEach(cat => { c[cat] = cat==="All Parts"?parts.length:parts.filter(p=>p.category===cat).length; }); return c;
  }, [parts]);

  const getBestIdx = alts => { const p = alts.map(a=>a.currency==="USD"?a.price*3.7:a.price); return p.indexOf(Math.min(...p)); };

  // ── PDF → base64
  const fileToBase64 = f => new Promise((res,rej) => {
    const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(f);
  });

  // ── Main parse flow
  const handleFile = f => {
    if (!f || f.type !== "application/pdf") { setParseError("Please upload a PDF file."); return; }
    setUploadFile(f); setParseError(null);
  };

  const startParse = async () => {
    if (!uploadFile) return;
    setUploadStep("parsing"); setParseError(null); setParseLog("Reading PDF…");
    try {
      const b64 = await fileToBase64(uploadFile);
      setParseLog("Sending to Claude AI for extraction…");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:4000,
          system: PARSE_SYSTEM_PROMPT,
          messages:[{
            role:"user",
            content:[
              { type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 } },
              { type:"text", text:"Extract all quoted line items from this quote PDF and return the JSON array as instructed." }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content.map(b=>b.text||"").join("");
      setParseLog("Parsing response…");
      const cleaned = raw.replace(/```json|```/g,"").trim();
      const jsonArr = JSON.parse(cleaned);
      if (!Array.isArray(jsonArr)) throw new Error("Claude did not return a JSON array.");
      const nextId = Math.max(...parts.map(p=>p.id), 100) + 1;
      const { parts: validated, warnings } = VALIDATE_PARTS(jsonArr, nextId);
      setParsedParts(validated);
      setParseWarnings(warnings);
      const initChecked = {};
      validated.forEach(p => { initChecked[p.id] = true; });
      setReviewChecked(initChecked);
      setUploadStep("review");
    } catch(e) {
      setParseError("Parse error: " + e.message);
      setUploadStep("idle");
    }
  };

  const confirmImport = () => {
    const toAdd = parsedParts.filter(p => reviewChecked[p.id]);
    setParts(prev => [...prev, ...toAdd]);
    // add doc entry
    const qRef = toAdd[0]?.quoteRef || uploadFile.name;
    const mfrs = [...new Set(toAdd.map(p=>p.manufacturer))].join(" / ");
    const newDoc = {
      id: "d" + (documents.length + 1),
      title: qRef,
      manufacturer: mfrs,
      type: "Quote",
      date: toAdd[0]?.date || new Date().toISOString().slice(0,10),
      quoteRef: qRef,
      catalogLink: null,
    };
    setDocuments(prev => [...prev, newDoc]);
    setUploadStep("done");
  };

  const resetUpload = () => {
    setUploadStep("idle"); setUploadFile(null); setParsedParts([]);
    setParseWarnings([]); setParseError(null); setParseLog(""); setReviewChecked({});
  };

  // ── Styles
  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font-family:'SF Mono',Consolas,monospace;font-size:13px}
a{color:#79c0ff;text-decoration:none}a:hover{text-decoration:underline}
.topbar{background:#161b22;border-bottom:1px solid #30363d;padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:50px;position:sticky;top:0;z-index:50}
.maintabs{background:#0d1117;border-bottom:1px solid #30363d;display:flex;gap:0;padding:0 20px;position:sticky;top:50px;z-index:49}
.mtab{background:transparent;border:none;border-bottom:2px solid transparent;color:#8b949e;padding:10px 18px;font-size:12px;cursor:pointer;font-family:inherit;transition:color .15s}
.mtab.active{color:#79c0ff;border-bottom-color:#1f6feb;font-weight:600}
.mtab.maint{color:#f2994a}.mtab.maint.active{color:#f2994a;border-bottom-color:#f2994a}
.toolbar{background:#161b22;border-bottom:1px solid #30363d;padding:8px 20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.search-wrap{position:relative;flex:1;min-width:160px;max-width:300px}
.search-icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:#8b949e;pointer-events:none}
.search{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:6px 9px 6px 28px;color:#c9d1d9;font-size:12px;outline:none;font-family:inherit}
.search:focus{border-color:#1f6feb}
select{background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;padding:5px 10px;font-size:12px;outline:none;cursor:pointer;font-family:inherit}
.tabs{display:flex;gap:3px;flex-wrap:wrap}
.tab{background:transparent;border:1px solid transparent;border-radius:5px;color:#8b949e;padding:4px 10px;font-size:11px;cursor:pointer;white-space:nowrap;font-family:inherit}
.tab.active{background:#1f6feb22;border-color:#1f6feb88;color:#79c0ff;font-weight:600}
.tab-count{background:#21262d;border-radius:8px;padding:1px 5px;font-size:10px;margin-left:4px;color:#8b949e}
.tab.active .tab-count{background:#1f6feb44;color:#79c0ff}
.temp-filter{display:flex;align-items:center;gap:8px;font-size:11px;color:#8b949e;flex-shrink:0}
.temp-val{color:#e3b341;font-weight:700;min-width:36px}
.add-btn{background:#1f6feb;border:none;border-radius:6px;color:#fff;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:inherit;display:flex;align-items:center;gap:6px}
.icon-btn{background:transparent;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;padding:6px 10px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap}
.main{padding:14px 20px;display:flex;gap:16px}
.table-wrap{flex:1;background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;min-width:0}
table{width:100%;border-collapse:collapse}
th{padding:8px 12px;text-align:left;font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.8px;font-weight:600;border-bottom:1px solid #30363d;background:#21262d;white-space:nowrap}
tr.dr{border-bottom:1px solid #21262d;cursor:pointer;transition:background .1s}
tr.dr:hover{background:#1f2937!important}
tr.dr.active-row{background:#1f2d45!important}
td{padding:9px 12px;vertical-align:middle}
.pn{font-family:'SF Mono',monospace;font-size:11px;color:#79c0ff;font-weight:600}
.cat-tag{color:#8b949e;font-size:10px;margin-top:2px}
.desc{color:#c9d1d9;font-size:12px;max-width:250px;line-height:1.4}
.sub{color:#8b949e;font-size:10px;margin-top:2px}
.mfr{color:#e6edf3;font-size:12px;font-weight:500}
.price{color:#3fb950;font-size:13px;font-weight:700;font-family:'SF Mono',monospace}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600}
.b-pass{background:#1a3d2b;border:1px solid #2a6044;color:#6fcf97}
.b-fail{background:#3d0f0f;border:1px solid #8b1a1a;color:#f85149}
.b-blue{background:#1e3a5f;border:1px solid #2d5a8e;color:#7eb8f7}
.b-gray{background:#21262d;border:1px solid #30363d;color:#8b949e}
.b-warn{background:#2d2209;border:1px solid #6a4f10;color:#e3b341}
.b-cad-ok{background:#1a3d2b;border:1px solid #2a6044;color:#6fcf97;font-size:10px}
.b-cad-miss{background:#21262d;border:1px solid #30363d;color:#8b949e;font-size:10px}
.lead-warn{color:#f2994a;font-size:11px;font-weight:600}
.lead-ok{color:#e6edf3;font-size:11px}
.empty{padding:40px;text-align:center;color:#8b949e}
.footer-note{padding:8px 12px;font-size:11px;color:#8b949e}
.detail-panel{width:360px;flex-shrink:0;background:#161b22;border:1px solid #30363d;border-radius:8px;max-height:calc(100vh - 130px);overflow-y:auto;position:sticky;top:116px}
.dp-header{padding:12px 14px 10px;border-bottom:1px solid #21262d}
.dp-close{background:transparent;border:none;color:#8b949e;font-size:16px;cursor:pointer;float:right;line-height:1}
.dp-pn{font-family:'SF Mono',monospace;font-size:13px;color:#79c0ff;font-weight:700;margin:5px 0 4px}
.q-tag{font-size:10px;background:#21262d;border:1px solid #30363d;border-radius:4px;padding:2px 7px;color:#8b949e;display:inline-block;margin-bottom:6px}
.dp-desc{font-size:12px;color:#c9d1d9;line-height:1.6;padding:8px 14px;border-bottom:1px solid #21262d}
.dp-sec{padding:10px 14px;border-bottom:1px solid #21262d}
.dp-stitle{font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:7px}
.dp-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;gap:8px}
.dp-key{color:#8b949e;flex-shrink:0}
.dp-val{color:#e6edf3;font-weight:500;text-align:right;word-break:break-word}
.dp-note{font-size:11px;color:#8b949e;line-height:1.6;margin-top:7px}
.cad-box{margin-top:8px;background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:10px 12px}
.cad-path{font-family:'SF Mono',monospace;font-size:10px;color:#8b949e;word-break:break-all;margin-top:4px}
.comp-table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11px}
.comp-table th{background:#0d1117;color:#8b949e;font-size:10px;text-transform:uppercase;padding:4px 7px;border:1px solid #21262d;text-align:left}
.comp-table td{padding:5px 7px;border:1px solid #21262d;vertical-align:middle}
.comp-table tr:nth-child(even) td{background:#0a0f14}
.best-badge{background:#1a3d2b;border:1px solid #2a6044;color:#6fcf97;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:600;margin-left:4px}
.ix-yes{background:#1e3a5f;color:#7eb8f7;border:1px solid #2d5a8e;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:600}
.ix-no{background:#2d2209;color:#e3b341;border:1px solid #6a4f10;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:600}
.vendor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;padding:0 20px 14px}
.vendor-card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:12px 14px}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;padding:16px 20px}
.doc-card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px}
.doc-icon{font-size:28px;margin-bottom:8px}
.doc-title{font-size:12px;font-weight:600;color:#e6edf3;margin-bottom:4px;line-height:1.4}
.doc-mfr{font-size:11px;color:#8b949e;margin-bottom:8px}
.doc-meta{font-size:10px;color:#8b949e;margin-bottom:10px}
.doc-btn{background:#21262d;border:1px solid #30363d;border-radius:5px;color:#c9d1d9;padding:4px 10px;font-size:11px;cursor:pointer;font-family:inherit;width:100%;text-align:center}
.doc-btn:hover{background:#30363d}
.maint-wrap{padding:16px 20px}
.maint-header{font-size:13px;color:#e6edf3;font-weight:600;margin-bottom:12px}
.maint-item{background:#161b22;border:1px solid #30363d;border-radius:7px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.maint-pn{font-family:'SF Mono',monospace;font-size:11px;color:#79c0ff;font-weight:600}
.maint-desc{font-size:11px;color:#8b949e;margin-top:2px}
.maint-issues{display:flex;flex-direction:column;gap:3px;align-items:flex-end}
.issue-tag{background:#3d2209;border:1px solid #7a4010;color:#f2994a;border-radius:3px;padding:2px 7px;font-size:10px;white-space:nowrap}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px}
.modal-box{background:#161b22;border:1px solid #30363d;border-radius:10px;width:720px;max-width:100%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.modal-head{padding:16px 20px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.modal-body{padding:20px;overflow-y:auto;flex:1}
.modal-foot{padding:12px 20px;border-top:1px solid #30363d;display:flex;justify-content:flex-end;gap:8px;flex-shrink:0}
.drop-zone{border:2px dashed #30363d;border-radius:10px;padding:40px 20px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s}
.drop-zone.over{border-color:#1f6feb;background:#1f6feb11}
.drop-zone.has-file{border-color:#2a6044;background:#1a3d2b22}
.cancel-btn{background:transparent;border:1px solid #30363d;border-radius:6px;color:#8b949e;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit}
.submit-btn{background:#1f6feb;border:none;border-radius:6px;color:#fff;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}
.submit-btn:disabled{opacity:.4;cursor:not-allowed}
.confirm-btn{background:#238636;border:none;border-radius:6px;color:#fff;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}
.parse-log{background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:12px;font-size:12px;color:#8b949e;margin-top:12px;min-height:60px}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid #30363d;border-top-color:#79c0ff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px}
@keyframes spin{to{transform:rotate(360deg)}}
.review-table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
.review-table th{background:#0d1117;color:#8b949e;text-transform:uppercase;font-size:10px;padding:5px 8px;border:1px solid #21262d;text-align:left}
.review-table td{padding:6px 8px;border:1px solid #21262d;vertical-align:middle}
.review-table tr:nth-child(even) td{background:#0a0f14}
.warn-box{background:#2d2209;border:1px solid #6a4f10;border-radius:6px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#e3b341}
.success-box{background:#1a3d2b;border:1px solid #2a6044;border-radius:8px;padding:20px;text-align:center}
`;

  const catColor = cat => {
    if (cat==="Fittings & Valves") return "#79c0ff";
    if (cat==="Instrumentation & Sensors") return "#d2a8ff";
    if (cat==="Piping & Tubing") return "#ffa657";
    return "#6fcf97";
  };

  return (
    <>
      <style>{css}</style>

      {/* Topbar */}
      <div className="topbar">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"#1f6feb",width:26,height:26,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff"}}>EP</div>
          <div>
            <div style={{fontWeight:600,fontSize:13,color:"#e6edf3"}}>Engineering Procurement Dashboard</div>
            <div style={{fontSize:10,color:"#8b949e"}}>ISI R&D · Parts Database v4.0</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          {[["Total Parts",parts.length,false],["Vendors",vendors.length,false],["Below 300°C",unrated,true],["Pending Tasks",maintItems.length,true]].map(([l,v,warn])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:17,fontWeight:700,color:warn?"#f85149":"#e6edf3",lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:"#8b949e",marginTop:3,textTransform:"uppercase",letterSpacing:.6}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="maintabs">
        {MAIN_TABS.map(t=>(
          <button key={t} className={`mtab${mainTab===t?" active":""}${t==="Maintenance"?" maint":""}`} onClick={()=>setMainTab(t)}>
            {t}{t==="Maintenance"&&<span style={{marginLeft:5,background:"#3d2209",border:"1px solid #7a4010",color:"#f2994a",borderRadius:8,padding:"0 5px",fontSize:10}}>{maintItems.length}</span>}
          </button>
        ))}
      </div>

      {/* ── PARTS VIEW ── */}
      {mainTab==="Parts" && <>
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search" placeholder="Search part, description, manufacturer..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select value={vendorFilter} onChange={e=>setVendorFilter(e.target.value)}>
            <option value="All Vendors">All Vendors</option>
            {vendors.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
          <div className="temp-filter">
            <span>Min temp:</span>
            <input type="range" min={0} max={500} step={25} value={minTemp} onChange={e=>setMinTemp(+e.target.value)} style={{width:80,accentColor:"#e3b341"}}/>
            <span className="temp-val">{minTemp>0?`≥${minTemp}°C`:"Off"}</span>
          </div>
          <div className="tabs">
            {CATEGORIES.map(c=>(
              <button key={c} className={`tab${activeCategory===c?" active":""}`} onClick={()=>setActiveCategory(c)}>
                {c}<span className="tab-count">{catCounts[c]}</span>
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={()=>setShowVendorDir(v=>!v)}>{showVendorDir?"✕ Vendors":"🏢 Vendors"}</button>
          <button className="add-btn" onClick={()=>{resetUpload();setShowUpload(true);}}>
            <span>📄</span> Upload Quote
          </button>
        </div>

        {showVendorDir && (
          <>
            <div className="vendor-grid">
              {Object.entries(VENDORS_INFO).map(([key,v])=>{
                const pc = parts.filter(p=>p.vendor===key).length;
                return (
                  <div key={key} className="vendor-card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#e6edf3"}}>{v.company}</div>
                      <span className="badge b-blue">{pc} parts</span>
                    </div>
                    <div style={{fontSize:11,color:"#8b949e",marginBottom:8,lineHeight:1.5}}>{v.notes}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,fontSize:12}}>
                      {v.phone&&<div style={{display:"flex",gap:6}}><span style={{color:"#8b949e"}}>☎</span><span>{v.phone}</span></div>}
                      <div style={{display:"flex",gap:6}}><span style={{color:"#8b949e"}}>✉</span><a href={`mailto:${v.email}`}>{v.email}</a></div>
                      <div style={{display:"flex",gap:6}}><span style={{color:"#8b949e"}}>🌐</span><a href={v.website} target="_blank" rel="noopener noreferrer">{v.website.replace("https://","")}</a></div>
                      <div style={{display:"flex",gap:6}}><span style={{color:"#8b949e"}}>📍</span><span style={{color:"#c9d1d9"}}>{v.country}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"0 20px 10px",fontSize:11,color:"#8b949e"}}>⚠ Contact details are best-effort — verify against original quote documents.</div>
          </>
        )}

        <div className="main">
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Part Number</th><th>Description</th><th>Manufacturer / Vendor</th>
                <th>Unit Price</th><th>Temp</th><th>Lead Time</th><th>300°C</th><th>CAD</th><th>≋</th>
              </tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={9} className="empty">No parts match current filters.</td></tr>
                  : filtered.map((p,i)=>{
                    const hasComp = !!MARKET_MAP[p.partNumber];
                    const isActive = selectedPart?.id===p.id;
                    return (
                      <tr key={p.id} className={`dr${isActive?" active-row":""}`}
                        style={{background:isActive?"#1f2d45":i%2===0?"#161b22":"#0d1117"}}
                        onClick={()=>setSelectedPart(isActive?null:p)}>
                        <td>
                          <div className="pn">{p.partNumber}</div>
                          <div className="cat-tag" style={{color:catColor(p.category)}}>{p.category}</div>
                        </td>
                        <td><div className="desc">{p.description}</div><div className="sub">{p.material!=="—"?`${p.material} · `:""}{p.connection}</div></td>
                        <td><div className="mfr">{p.manufacturer}</div><div className="sub">via {p.vendor}</div></td>
                        <td><div className="price">{fmtPrice(p.unitPrice,p.currency)}</div><div className="sub">{p.currency}</div></td>
                        <td><div style={{fontSize:11,color:p.tempRatingC==null?"#8b949e":p.tempRatingC>=300?"#6fcf97":"#f85149"}}>{p.tempRatingC!=null?`${p.tempRatingC}°C`:"—"}</div></td>
                        <td><div className={isLongLead(p.leadTime)?"lead-warn":"lead-ok"}>{isLongLead(p.leadTime)?"⚠ ":""}{p.leadTime}</div></td>
                        <td>{p.tempRated300?<span className="badge b-pass">✓</span>:<span className="badge b-fail">✕</span>}</td>
                        <td>{p.cadFile?<span className="badge b-cad-ok">STEP</span>:<span className="badge b-cad-miss">—</span>}</td>
                        <td>{hasComp?<span className="badge b-blue">≋</span>:<span style={{color:"#4d4d4d"}}>—</span>}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
            <div className="footer-note">Showing {filtered.length} of {parts.length} parts{minTemp>0?` · Temp filter: ≥${minTemp}°C`:""} · Click any row for detail</div>
          </div>

          {selectedPart && (
            <div className="detail-panel">
              <div className="dp-header">
                <button className="dp-close" onClick={()=>setSelectedPart(null)}>✕</button>
                <div style={{fontSize:10,color:"#8b949e",textTransform:"uppercase",letterSpacing:.8}}>Part Detail</div>
                <div className="dp-pn">{selectedPart.partNumber}</div>
                <div className="q-tag">{selectedPart.quoteRef} · {selectedPart.date}</div><br/>
                <span className={`badge ${selectedPart.tempRated300?"b-pass":"b-fail"}`}>{selectedPart.tempRated300?"✓ 300°C Rated":"✕ Unconfirmed 300°C"}</span>
              </div>
              <div className="dp-desc">{selectedPart.description}</div>
              <div className="dp-sec">
                <div className="dp-stitle">Vendor Contact</div>
                {VENDORS_INFO[selectedPart.vendor] ? (() => {
                  const v = VENDORS_INFO[selectedPart.vendor];
                  return (<>
                    <div className="dp-row"><span className="dp-key">Company</span><span className="dp-val">{v.company}</span></div>
                    <div className="dp-row"><span className="dp-key">Country</span><span className="dp-val">{v.country}</span></div>
                    {v.phone&&<div className="dp-row"><span className="dp-key">Phone</span><span className="dp-val">{v.phone}</span></div>}
                    <div className="dp-row"><span className="dp-key">Email</span><a href={`mailto:${v.email}`} style={{fontSize:12}}>{v.email}</a></div>
                    <div className="dp-row"><span className="dp-key">Web</span><a href={v.website} target="_blank" rel="noopener noreferrer" style={{fontSize:12}}>{v.website.replace("https://","")}</a></div>
                  </>);
                })() : <div style={{fontSize:11,color:"#8b949e"}}>Vendor not in directory.</div>}
              </div>
              <div className="dp-sec">
                <div className="dp-stitle">Identification</div>
                {[["Category",selectedPart.category],["Manufacturer",selectedPart.manufacturer],["Vendor",selectedPart.vendor],["Material",selectedPart.material],["Connection",selectedPart.connection]].map(([k,v])=>(
                  <div className="dp-row" key={k}><span className="dp-key">{k}</span><span className="dp-val">{v}</span></div>
                ))}
              </div>
              <div className="dp-sec">
                <div className="dp-stitle">Technical Ratings</div>
                <div className="dp-row"><span className="dp-key">Max Temp</span><span className="dp-val" style={{color:selectedPart.tempRatingC==null?"#8b949e":selectedPart.tempRatingC>=300?"#6fcf97":"#f85149"}}>{selectedPart.tempRatingC!=null?`${selectedPart.tempRatingC}°C`:"Not specified"}</span></div>
                <div className="dp-row"><span className="dp-key">Max Pressure</span><span className="dp-val">{selectedPart.pressureRatingBar!=null?`${selectedPart.pressureRatingBar} bar`:"Not specified"}</span></div>
                <div className="dp-row"><span className="dp-key">300°C</span><span className="dp-val" style={{color:selectedPart.tempRated300?"#6fcf97":"#f85149"}}>{selectedPart.tempRated300?"✓ Confirmed":"✕ Not confirmed"}</span></div>
                {selectedPart.catalogLink ? <div style={{marginTop:8}}><a href={selectedPart.catalogLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11}}>→ Manufacturer catalog ↗</a></div>
                  : <div className="dp-note">No catalog link — see Maintenance tab.</div>}
              </div>
              <div className="dp-sec">
                <div className="dp-stitle">CAD Repository</div>
                <div className="dp-row"><span className="dp-key">Status</span><span>{selectedPart.cadFile?<span className="badge b-cad-ok">File linked</span>:<span className="badge b-cad-miss">Missing</span>}</span></div>
                <div className="cad-box">
                  <div style={{fontSize:10,color:"#8b949e"}}>Path</div>
                  <div className="cad-path">{CAD_FOLDER_ROOT}{selectedPart.cadFile||<span style={{color:"#4d4d4d"}}>{selectedPart.partNumber}.STEP</span>}</div>
                </div>
              </div>
              <div className="dp-sec">
                <div className="dp-stitle">Commercial</div>
                {[["Unit Price",fmtPrice(selectedPart.unitPrice,selectedPart.currency)],["Currency",selectedPart.currency],["Status",selectedPart.status],["Lead Time",selectedPart.leadTime]].map(([k,v])=>(
                  <div className="dp-row" key={k}><span className="dp-key">{k}</span><span className="dp-val">{v}</span></div>
                ))}
              </div>
              <div className="dp-sec">
                <div className="dp-stitle">Market Comparison</div>
                {MARKET_MAP[selectedPart.partNumber] ? (() => {
                  const md = MARKET_MAP[selectedPart.partNumber];
                  const bi = getBestIdx(md.alternatives);
                  return (<>
                    <div style={{fontSize:11,color:"#8b949e",marginBottom:6}}><strong style={{color:"#c9d1d9"}}>Type:</strong> {md.partType}</div>
                    <table className="comp-table"><thead><tr><th>Vendor</th><th>Part No.</th><th>Price</th><th>Compat.</th></tr></thead>
                      <tbody>{md.alternatives.map((a,i)=>(
                        <tr key={i}><td style={{color:"#c9d1d9",fontSize:10}}>{a.vendor}{i===bi&&<span className="best-badge">Best</span>}</td>
                          <td style={{fontFamily:"monospace",fontSize:10,color:"#79c0ff"}}>{a.partNo}</td>
                          <td style={{color:"#3fb950",fontWeight:700,fontFamily:"monospace",fontSize:11}}>{fmtPrice(a.price,a.currency)}</td>
                          <td><span className={a.intermixable?"ix-yes":"ix-no"}>{a.intermixable?"Intermix":"Func.Eq."}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                    <div className="dp-note" style={{marginTop:6,padding:"5px 8px",background:"#0d1117",borderRadius:4,border:"1px solid #21262d"}}>{md.notes}</div>
                  </>);
                })() : <div style={{fontSize:11,color:"#8b949e",fontStyle:"italic"}}>No cross-reference data recorded.</div>}
              </div>
            </div>
          )}
        </div>
      </>}

      {/* ── DOCUMENT LIBRARY ── */}
      {mainTab==="Document Library" && (
        <div>
          <div style={{padding:"12px 20px 0",display:"flex",justifyContent:"flex-end"}}>
            <button className="add-btn" onClick={()=>{resetUpload();setShowUpload(true);}}>📄 Upload Quote</button>
          </div>
          <div className="doc-grid">
            {documents.map(d=>(
              <div key={d.id} className="doc-card">
                <div className="doc-icon">📄</div>
                <div className="doc-title">{d.title}</div>
                <div className="doc-mfr">{d.manufacturer}</div>
                <div className="doc-meta">
                  <span className={`badge ${d.type==="Quote"?"b-blue":"b-gray"}`} style={{marginRight:6}}>{d.type}</span>
                  {d.date}
                </div>
                {d.catalogLink ? <a href={d.catalogLink} target="_blank" rel="noopener noreferrer"><button className="doc-btn">Open Catalog ↗</button></a>
                  : <button className="doc-btn" style={{color:"#8b949e",cursor:"default"}} disabled>No link available</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAINTENANCE ── */}
      {mainTab==="Maintenance" && (
        <div className="maint-wrap">
          <div className="maint-header">Pending Tasks — {maintItems.length} items require attention</div>
          <div style={{fontSize:11,color:"#8b949e",marginBottom:14,lineHeight:1.6}}>Parts missing catalog links or vendor contact information.</div>
          {maintItems.map(item=>(
            <div key={item.id} className="maint-item">
              <div><div className="maint-pn">{item.partNumber}</div><div className="maint-desc">{item.description}</div></div>
              <div className="maint-issues">{item.issues.map(i=><span key={i} className="issue-tag">{i}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── UPLOAD MODAL ── */}
      {showUpload && (
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget&&uploadStep!=="parsing"){resetUpload();setShowUpload(false);}}}>
          <div className="modal-box">
            <div className="modal-head">
              <div>
                <div style={{fontWeight:600,fontSize:14,color:"#e6edf3"}}>
                  {uploadStep==="idle"&&"📄 Upload Quote PDF"}
                  {uploadStep==="parsing"&&<><span className="spinner"/>Parsing Quote…</>}
                  {uploadStep==="review"&&`✅ Review Extracted Parts (${parsedParts.length} found)`}
                  {uploadStep==="done"&&"🎉 Import Complete"}
                </div>
                {uploadStep!=="parsing"&&<div style={{fontSize:11,color:"#8b949e",marginTop:2}}>
                  {uploadStep==="idle"&&"AI will extract all line items and classify them automatically"}
                  {uploadStep==="review"&&"Deselect any items you don't want to import, then confirm"}
                  {uploadStep==="done"&&"Parts added to database and quote saved to Document Library"}
                </div>}
              </div>
              {uploadStep!=="parsing"&&<button className="dp-close" style={{fontSize:20}} onClick={()=>{resetUpload();setShowUpload(false);}}>✕</button>}
            </div>

            <div className="modal-body">
              {/* IDLE */}
              {uploadStep==="idle" && <>
                <input ref={fileRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                <div className={`drop-zone${dragOver?" over":""}${uploadFile?" has-file":""}`}
                  onClick={()=>fileRef.current.click()}
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}>
                  {uploadFile ? <>
                    <div style={{fontSize:32,marginBottom:8}}>📄</div>
                    <div style={{fontWeight:600,color:"#6fcf97",fontSize:13}}>{uploadFile.name}</div>
                    <div style={{fontSize:11,color:"#8b949e",marginTop:4}}>{(uploadFile.size/1024).toFixed(1)} KB · Click to change</div>
                  </> : <>
                    <div style={{fontSize:40,marginBottom:10}}>⬆️</div>
                    <div style={{fontWeight:600,color:"#c9d1d9",fontSize:13}}>Drop a Quote PDF here</div>
                    <div style={{fontSize:11,color:"#8b949e",marginTop:6}}>or click to browse · Supports Hebrew & English quotes</div>
                  </>}
                </div>
                {parseError&&<div style={{marginTop:10,padding:"8px 12px",background:"#3d0f0f",border:"1px solid #8b1a1a",borderRadius:6,fontSize:12,color:"#f85149"}}>{parseError}</div>}
                <div style={{marginTop:14,fontSize:11,color:"#8b949e",lineHeight:1.7}}>
                  <strong style={{color:"#c9d1d9"}}>What happens next:</strong><br/>
                  Claude AI reads the PDF, extracts every line item, classifies each part into the correct category, applies the 300°C rating rules, and presents a review table before anything is added to the database.
                </div>
              </>}

              {/* PARSING */}
              {uploadStep==="parsing" && (
                <div className="parse-log">
                  <div>{parseLog}</div>
                  <div style={{marginTop:8,color:"#4d4d4d",fontSize:11}}>This usually takes 10–20 seconds for a standard quote PDF…</div>
                </div>
              )}

              {/* REVIEW */}
              {uploadStep==="review" && <>
                {parseWarnings.length>0 && (
                  <div className="warn-box">
                    <strong>⚠ Auto-corrections applied:</strong>
                    {parseWarnings.map((w,i)=>(
                      <div key={i} style={{marginTop:4}}>· <strong>{w.partNumber}</strong>: {w.warnings.join(", ")}</div>
                    ))}
                  </div>
                )}
                <div style={{fontSize:11,color:"#8b949e",marginBottom:8}}>
                  <strong style={{color:"#c9d1d9"}}>{Object.values(reviewChecked).filter(Boolean).length}</strong> of {parsedParts.length} parts selected for import.
                  <button onClick={()=>{const a={}; parsedParts.forEach(p=>a[p.id]=true); setReviewChecked(a);}} style={{marginLeft:10,background:"transparent",border:"none",color:"#79c0ff",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Select all</button>
                  <button onClick={()=>{const a={}; parsedParts.forEach(p=>a[p.id]=false); setReviewChecked(a);}} style={{marginLeft:6,background:"transparent",border:"none",color:"#79c0ff",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Deselect all</button>
                </div>
                <table className="review-table">
                  <thead><tr><th style={{width:28}}></th><th>Part Number</th><th>Description</th><th>Category</th><th>Price</th><th>300°C</th><th>Lead</th></tr></thead>
                  <tbody>
                    {parsedParts.map(p=>(
                      <tr key={p.id} style={{opacity:reviewChecked[p.id]?1:0.4}}>
                        <td><input type="checkbox" checked={!!reviewChecked[p.id]} onChange={e=>setReviewChecked(prev=>({...prev,[p.id]:e.target.checked}))}/></td>
                        <td style={{fontFamily:"monospace",color:"#79c0ff",fontSize:10}}>{p.partNumber}</td>
                        <td style={{color:"#c9d1d9",maxWidth:220}}>{p.description}</td>
                        <td><span style={{fontSize:9,color:catColor(p.category),background:"#21262d",borderRadius:3,padding:"1px 5px",whiteSpace:"nowrap"}}>{p.category}</span></td>
                        <td style={{color:"#3fb950",fontFamily:"monospace",fontWeight:700,fontSize:11}}>{fmtPrice(p.unitPrice,p.currency)}</td>
                        <td>{p.tempRated300?<span style={{color:"#6fcf97",fontSize:11}}>✓</span>:<span style={{color:"#f85149",fontSize:11}}>✕</span>}</td>
                        <td style={{fontSize:10,color:"#8b949e",whiteSpace:"nowrap"}}>{p.leadTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>}

              {/* DONE */}
              {uploadStep==="done" && (
                <div className="success-box">
                  <div style={{fontSize:40,marginBottom:12}}>✅</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#6fcf97",marginBottom:6}}>
                    {parsedParts.filter(p=>reviewChecked[p.id]).length} parts imported successfully
                  </div>
                  <div style={{fontSize:12,color:"#8b949e"}}>Quote added to Document Library · Parts now visible in all tabs</div>
                </div>
              )}
            </div>

            <div className="modal-foot">
              {uploadStep==="idle" && <>
                <button className="cancel-btn" onClick={()=>{resetUpload();setShowUpload(false);}}>Cancel</button>
                <button className="submit-btn" disabled={!uploadFile} onClick={startParse}>Parse with AI →</button>
              </>}
              {uploadStep==="review" && <>
                <button className="cancel-btn" onClick={resetUpload}>← Re-upload</button>
                <button className="confirm-btn" disabled={!Object.values(reviewChecked).some(Boolean)} onClick={confirmImport}>
                  Confirm Import ({Object.values(reviewChecked).filter(Boolean).length} parts)
                </button>
              </>}
              {uploadStep==="done" && (
                <button className="submit-btn" onClick={()=>{resetUpload();setShowUpload(false);}}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
