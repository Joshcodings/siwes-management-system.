export interface CompanySeedData {
  name: string;
  email: string;
  industry_type: string;
  skills: string[];
  address: string;
  lat: number;
  lon: number;
}

export const seedCompanies: CompanySeedData[] = [
  // LAGOS - Victoria Island
  { name: 'Flutterwave', email: 'careers@flutterwave.com', industry_type: 'Fintech', skills: ['Node.js','Python','React','APIs','Payments'], address: '162 Victoria Island, Lagos', lat: 6.4281, lon: 3.4219 },
  { name: 'Paystack', email: 'careers@paystack.com', industry_type: 'Fintech', skills: ['Ruby','Go','React','PostgreSQL'], address: 'Plot 1261A, Ahmadu Bello Way, Victoria Island', lat: 6.4268, lon: 3.4175 },
  { name: 'Interswitch', email: 'hr@interswitchgroup.com', industry_type: 'Fintech', skills: ['Java','Spring Boot','Oracle','Microservices'], address: '1618 Oyin Jolayemi, Victoria Island', lat: 6.4295, lon: 3.4240 },
  { name: 'The Nest Innovation Hub', email: 'info@thenest.ng', industry_type: 'Tech Hub', skills: ['Entrepreneurship','Product','Design'], address: 'Victoria Island, Lagos', lat: 6.4260, lon: 3.4150 },
  { name: 'Cellulant Nigeria', email: 'careers@cellulant.io', industry_type: 'Fintech', skills: ['Java','Python','Mobile','APIs'], address: 'Victoria Island, Lagos', lat: 6.4302, lon: 3.4190 },
  { name: 'eTranzact', email: 'info@etranzact.com', industry_type: 'Fintech', skills: ['Java','SQL','Mobile Payments'], address: '5 Okotie Eboh Close, Victoria Island', lat: 6.4315, lon: 3.4210 },
  { name: 'Paga Nigeria', email: 'careers@mypaga.com', industry_type: 'Fintech', skills: ['Python','React','Node.js','Payments'], address: 'Victoria Island, Lagos', lat: 6.4273, lon: 3.4232 },
  { name: 'MainOne', email: 'careers@mainone.net', industry_type: 'Telecommunications', skills: ['Networking','CCNA','Linux','Cloud'], address: 'Apapa, Lagos', lat: 6.4430, lon: 3.3560 },
  
  // LAGOS - Ikoyi
  { name: 'MTN Nigeria HQ', email: 'careers@mtnnigeria.net', industry_type: 'Telecommunications', skills: ['Networking','DevOps','Python','Data'], address: 'MTN House, Ikoyi, Lagos', lat: 6.4526, lon: 3.4293 },
  { name: 'Airtel Nigeria', email: 'careers@ng.airtel.com', industry_type: 'Telecommunications', skills: ['Networking','Java','Billing Systems'], address: 'Airtel Nigeria HQ, Ikoyi', lat: 6.4540, lon: 3.4280 },
  { name: 'Globacom', email: 'careers@gloworld.com', industry_type: 'Telecommunications', skills: ['Telecom','Java','Oracle','Networking'], address: 'Mike Adenuga Towers, Ikoyi', lat: 6.4510, lon: 3.4310 },
  { name: 'PiggyVest', email: 'careers@piggyvest.com', industry_type: 'Fintech', skills: ['React Native','Node.js','AWS','Savings'], address: 'Ikoyi, Lagos', lat: 6.4545, lon: 3.4320 },
  { name: 'Cowrywise', email: 'careers@cowrywise.com', industry_type: 'Fintech', skills: ['Python','React','Investment APIs'], address: 'Ikoyi, Lagos', lat: 6.4500, lon: 3.4305 },
  
  // LAGOS - Yaba (Silicon Lagoon)
  { name: 'Andela Nigeria', email: 'careers@andela.com', industry_type: 'Software Development', skills: ['JavaScript','Python','React','Node.js','AWS'], address: '438 Yaba, Lagos', lat: 6.5054, lon: 3.3736 },
  { name: 'Co-Creation Hub (CcHub)', email: 'info@cchubnigeria.com', industry_type: 'Tech Hub', skills: ['Product Design','UX','Agile'], address: '294 Herbert Macaulay, Yaba', lat: 6.5038, lon: 3.3760 },
  { name: 'Kuda Bank', email: 'careers@kuda.com', industry_type: 'Neobank', skills: ['Kotlin','Swift','Go','Microservices'], address: 'Yaba, Lagos', lat: 6.5064, lon: 3.3748 },
  { name: 'Semicolon Africa', email: 'info@semicolon.africa', industry_type: 'Tech Education', skills: ['JavaScript','Java','Software Engineering'], address: 'Yaba, Lagos', lat: 6.5050, lon: 3.3720 },
  { name: 'Decagon Institute', email: 'info@decagoninstitute.org', industry_type: 'Tech Education', skills: ['Java','Python','Data Structures'], address: 'Yaba, Lagos', lat: 6.5045, lon: 3.3745 },
  { name: 'Moniepoint', email: 'careers@moniepoint.com', industry_type: 'Fintech', skills: ['Java','React','PostgreSQL','APIs'], address: 'Yaba, Lagos', lat: 6.5070, lon: 3.3730 },
  { name: 'TeamApt', email: 'careers@teamapt.com', industry_type: 'Fintech', skills: ['Spring Boot','React','AWS'], address: 'Yaba, Lagos', lat: 6.5080, lon: 3.3755 },
  { name: 'Mono', email: 'careers@mono.co', industry_type: 'Fintech', skills: ['Node.js','PostgreSQL','Open Banking'], address: 'Yaba, Lagos', lat: 6.5035, lon: 3.3770 },

  // LAGOS - Lekki
  { name: 'Seamfix Nigeria', email: 'careers@seamfix.com', industry_type: 'Identity Tech', skills: ['Java','Biometrics','APIs','Android'], address: 'Lekki Phase 1, Lagos', lat: 6.4382, lon: 3.4905 },
  { name: 'Helium Health', email: 'careers@heliumhealth.com', industry_type: 'Health Tech', skills: ['React','Node.js','EMR Systems'], address: 'Lekki, Lagos', lat: 6.4400, lon: 3.4950 },
  { name: 'Lifebank', email: 'careers@lifebank.ng', industry_type: 'Health Tech', skills: ['Python','Logistics','Mobile'], address: 'Lekki, Lagos', lat: 6.4370, lon: 3.4930 },
  { name: 'Kobo360', email: 'careers@kobo360.com', industry_type: 'Logistics Tech', skills: ['Python','React','Logistics APIs'], address: 'Lekki, Lagos', lat: 6.4410, lon: 3.4860 },
  { name: 'MAX.ng', email: 'careers@max.ng', industry_type: 'Mobility Tech', skills: ['React Native','Node.js','GPS'], address: 'Lekki, Lagos', lat: 6.4360, lon: 3.4970 },
  { name: 'Carbon (One Finance)', email: 'careers@getcarbon.co', industry_type: 'Fintech', skills: ['Python','Go','React','Credit Scoring'], address: 'Lekki, Lagos', lat: 6.4355, lon: 3.4880 },
  { name: 'OPay Nigeria', email: 'careers@opay.com', industry_type: 'Fintech', skills: ['Java','React Native','Payments'], address: 'Lekki, Lagos', lat: 6.4390, lon: 3.4915 },
  
  // LAGOS - Ikeja
  { name: 'SystemSpecs Nigeria', email: 'careers@systemspecs.com.ng', industry_type: 'Software', skills: ['Java','SQL','ERP','Remita'], address: 'Ikeja, Lagos', lat: 6.5944, lon: 3.3427 },
  { name: 'Zinox Group', email: 'hr@zinox.com', industry_type: 'ICT', skills: ['Hardware','Networking','IT Support'], address: 'Ikeja, Lagos', lat: 6.5930, lon: 3.3400 },
  { name: 'Spectranet', email: 'careers@spectranet.com.ng', industry_type: 'Internet Services', skills: ['Networking','LTE','Customer Support'], address: 'Ikeja, Lagos', lat: 6.5955, lon: 3.3445 },
  { name: 'IHS Towers', email: 'careers@ihstowers.com', industry_type: 'Telecommunications', skills: ['Telecom','Civil Engineering','Networking'], address: 'Ikeja, Lagos', lat: 6.5968, lon: 3.3460 },
  { name: 'Rack Centre', email: 'info@rackcentre.com.ng', industry_type: 'Data Centre', skills: ['Data Centre','Linux','Networking','AWS'], address: 'Ikeja, Lagos', lat: 6.5920, lon: 3.3415 },
  { name: 'Tizeti Network', email: 'careers@tizeti.com', industry_type: 'Internet Services', skills: ['Networking','WISP','Linux'], address: 'Ikeja, Lagos', lat: 6.5940, lon: 3.3435 },
  
  // LAGOS - Other
  { name: 'Farmcrowdy', email: 'careers@farmcrowdy.com', industry_type: 'AgriTech', skills: ['React','Node.js','Mobile','Agriculture'], address: 'Surulere, Lagos', lat: 6.4946, lon: 3.3537 },
  { name: 'TradeDepot', email: 'careers@tradedepot.co', industry_type: 'B2B Commerce', skills: ['Node.js','React','Supply Chain'], address: 'Lagos', lat: 6.5200, lon: 3.3800 },
  { name: 'Gokada', email: 'careers@gokada.ng', industry_type: 'Logistics Tech', skills: ['React Native','Node.js','Maps'], address: 'Lagos', lat: 6.5150, lon: 3.3650 },
  { name: 'Chipper Cash Nigeria', email: 'careers@chippercash.com', industry_type: 'Fintech', skills: ['Go','React','Cross-border Payments'], address: 'Lagos Island', lat: 6.4530, lon: 3.3957 },
  { name: 'Shuttlers', email: 'careers@shuttlers.ng', industry_type: 'Mobility Tech', skills: ['React Native','Node.js','Route Optimization'], address: 'Lagos', lat: 6.5100, lon: 3.3590 },
  { name: '54gene', email: 'careers@54gene.com', industry_type: 'BioTech', skills: ['Bioinformatics','Python','R','Data Science'], address: 'Oregun, Lagos', lat: 6.5750, lon: 3.3540 },
  { name: 'Remedial Health', email: 'careers@remedial.health', industry_type: 'Health Tech', skills: ['React','Node.js','Pharmacy Tech'], address: 'Lagos', lat: 6.5200, lon: 3.3900 },
  { name: 'Drugstoc', email: 'careers@drugstoc.com', industry_type: 'Health Tech', skills: ['Python','Supply Chain','Django'], address: 'Lagos', lat: 6.5180, lon: 3.3870 },
  { name: 'Releaf Africa', email: 'careers@releaf.africa', industry_type: 'AgriTech', skills: ['Data Science','Python','ML','IoT'], address: 'Lagos', lat: 6.5300, lon: 3.3700 },
  { name: 'Alerzo', email: 'careers@alerzo.com', industry_type: 'B2B Commerce', skills: ['React Native','Node.js','Logistics'], address: 'Lagos', lat: 6.5050, lon: 3.3810 },
  { name: 'VFD Group', email: 'careers@vfdgroup.com', industry_type: 'Fintech', skills: ['Java','React','Banking Systems'], address: 'Ikeja GRA, Lagos', lat: 6.5830, lon: 3.3560 },
  { name: 'Credpal', email: 'careers@credpal.com', industry_type: 'Fintech', skills: ['Node.js','React','Credit APIs'], address: 'Lagos', lat: 6.5110, lon: 3.3620 },
  { name: 'Unified Payments', email: 'info@up.com.ng', industry_type: 'Fintech', skills: ['Java','POS Systems','Payment APIs'], address: 'Victoria Island, Lagos', lat: 6.4305, lon: 3.4255 },
  { name: 'Ingressive for Good', email: 'info@ingressive.com', industry_type: 'Tech NGO', skills: ['JavaScript','Career Coaching','DevOps'], address: 'Yaba, Lagos', lat: 6.5030, lon: 3.3780 },
  { name: 'Tech4Dev', email: 'info@tech4dev.com', industry_type: 'Tech Education', skills: ['Python','Data Analysis','Web Dev'], address: 'Yaba, Lagos', lat: 6.5060, lon: 3.3790 },
  { name: '9mobile Nigeria', email: 'careers@9mobile.com.ng', industry_type: 'Telecommunications', skills: ['Networking','Telecom','4G LTE'], address: 'Victoria Island, Lagos', lat: 6.4290, lon: 3.4180 },
  { name: 'Lidya Nigeria', email: 'careers@lidya.co', industry_type: 'Fintech', skills: ['Python','ML','Credit Scoring','React'], address: 'Lekki, Lagos', lat: 6.4420, lon: 3.5000 },

  // ABUJA
  { name: 'Galaxy Backbone', email: 'careers@galaxybackbone.com.ng', industry_type: 'Government ICT', skills: ['Networking','Cloud','Cybersecurity','Linux'], address: 'Plot 1021, Cadastral Zone, Abuja', lat: 9.0579, lon: 7.4951 },
  { name: 'NITDA Abuja', email: 'info@nitda.gov.ng', industry_type: 'Government Tech', skills: ['Policy','IT Governance','Cybersecurity'], address: 'NITDA HQ, Mabushi, Abuja', lat: 9.0844, lon: 7.4305 },
  { name: 'eProcess Technologies', email: 'info@eprocess.com.ng', industry_type: 'Software', skills: ['Java','Oracle','ERP'], address: 'Maitama, Abuja', lat: 9.0840, lon: 7.4850 },
  { name: 'Zinox Abuja Office', email: 'hr@zinox.com', industry_type: 'ICT', skills: ['Hardware','Networking','IT Support'], address: 'Wuse 2, Abuja', lat: 9.0765, lon: 7.4869 },
  { name: 'Rovedas Nigeria', email: 'info@rovedas.com', industry_type: 'Software', skills: ['PHP','MySQL','Business Intelligence'], address: 'Garki, Abuja', lat: 9.0544, lon: 7.4862 },
  { name: 'Soft Alliance & Resources', email: 'careers@softalliance.com', industry_type: 'Enterprise Software', skills: ['SAP','Oracle','ERP'], address: 'Gwarinpa, Abuja', lat: 9.1207, lon: 7.4029 },
  { name: 'Infobip Nigeria (Abuja)', email: 'nigeria@infobip.com', industry_type: 'Communications Tech', skills: ['APIs','CPaaS','Node.js','Messaging'], address: 'Jabi, Abuja', lat: 9.0787, lon: 7.4261 },
  { name: 'Deimos Cloud (Abuja)', email: 'info@deimos.co.za', industry_type: 'Cloud Services', skills: ['Kubernetes','Terraform','AWS','DevOps'], address: 'Central Business District, Abuja', lat: 9.0579, lon: 7.4850 },
  { name: 'Gilead Information Systems', email: 'info@gileadsystems.com', industry_type: 'Software', skills: ['Python','Django','React','SQL'], address: 'Area 11, Garki, Abuja', lat: 9.0500, lon: 7.4900 },
  { name: 'NIMC (Abuja)', email: 'info@nimc.gov.ng', industry_type: 'Government Tech', skills: ['Identity Management','Biometrics','Java'], address: 'Plot 962 Cadastral Zone, Abuja', lat: 9.0620, lon: 7.4780 },

  // PORT HARCOURT
  { name: 'Inlaks Nigeria (PH)', email: 'hr@inlaks.com', industry_type: 'ICT Infrastructure', skills: ['Networking','ATM Systems','IT Support'], address: 'GRA Phase 2, Port Harcourt', lat: 4.8396, lon: 7.0133 },
  { name: 'Business Application Associates', email: 'info@baanigeria.com', industry_type: 'Software', skills: ['Java','SQL','ERP'], address: 'Old GRA, Port Harcourt', lat: 4.8156, lon: 7.0014 },
  { name: 'Uptech ICT', email: 'info@uptechnigeria.com', industry_type: 'ICT Solutions', skills: ['Networking','CCTV','IT Support'], address: 'Trans Amadi, Port Harcourt', lat: 4.8230, lon: 7.0200 },
  { name: 'ICT Brokers Nigeria', email: 'info@ictbrokers.com.ng', industry_type: 'Tech Consulting', skills: ['Consulting','Networking','Cloud'], address: 'Rumuola, Port Harcourt', lat: 4.8320, lon: 7.0120 },
  { name: 'Petroleum Technology Development Fund Tech', email: 'info@ptdf.gov.ng', industry_type: 'Government Tech', skills: ['Data Analysis','Python','GIS'], address: 'Forces Avenue, Port Harcourt', lat: 4.8500, lon: 7.0080 },

  // IBADAN
  { name: 'Jobberman Nigeria HQ', email: 'careers@jobberman.com', industry_type: 'HR Tech', skills: ['React','Node.js','Job Portals','SEO'], address: 'Ring Road, Ibadan', lat: 7.3919, lon: 3.9470 },
  { name: 'Thinktech Solutions', email: 'info@thinktechng.com', industry_type: 'Software', skills: ['PHP','Laravel','MySQL','Mobile'], address: 'Bodija, Ibadan', lat: 7.4241, lon: 3.9068 },
  { name: 'Bitmast Technologies', email: 'info@bitmast.com', industry_type: 'Software Development', skills: ['Node.js','React','Mobile Dev'], address: 'Challenge, Ibadan', lat: 7.3750, lon: 3.8980 },
  { name: 'Ibadan Innovation Hub', email: 'info@ibadanhub.com', industry_type: 'Tech Hub', skills: ['Product Design','Entrepreneurship','Coding'], address: 'Dugbe, Ibadan', lat: 7.3800, lon: 3.8900 },

  // KANO
  { name: 'Kano Digital Hub', email: 'info@kanodigitalhub.com', industry_type: 'Tech Hub', skills: ['Mobile Dev','Web Dev','Digital Marketing'], address: 'Nassarawa, Kano', lat: 11.9937, lon: 8.5222 },
  { name: 'Outsource Global Technologies', email: 'careers@outsourceglobal.com', industry_type: 'BPO', skills: ['Customer Support','Data Entry','CRM'], address: 'Kano Municipal, Kano', lat: 12.0034, lon: 8.5190 },
  { name: 'Convergence ICT', email: 'info@convergenceict.com', industry_type: 'ICT Solutions', skills: ['Networking','CCTV','IT Infrastructure'], address: 'Bompai, Kano', lat: 12.0100, lon: 8.5000 },

  // ENUGU
  { name: 'EduTech Nigeria (Enugu)', email: 'info@edutechng.com', industry_type: 'EdTech', skills: ['LMS','React','E-learning'], address: 'GRA Enugu', lat: 6.4519, lon: 7.5135 },
  { name: 'Roojoom Nigeria', email: 'info@roojoom.com', industry_type: 'Digital Media', skills: ['Content Tech','JavaScript','APIs'], address: 'Independence Layout, Enugu', lat: 6.4400, lon: 7.5000 },
  { name: 'TalentQL', email: 'careers@talentql.com', industry_type: 'HR Tech', skills: ['React','Python','Talent Matching','ML'], address: 'Enugu', lat: 6.4600, lon: 7.5200 },

  // KADUNA
  { name: 'Arewa ICT Hub', email: 'info@arewahub.com', industry_type: 'Tech Hub', skills: ['Web Dev','Mobile Dev','Design'], address: 'Barnawa, Kaduna', lat: 10.5200, lon: 7.4500 },
  { name: 'Digital Encode Limited', email: 'info@digitalencode.net', industry_type: 'Cybersecurity', skills: ['Cybersecurity','Penetration Testing','SIEM'], address: 'Kaduna', lat: 10.5300, lon: 7.4400 },

  // BENIN CITY
  { name: 'Spark Tech Hub (Benin)', email: 'info@sparkhub.ng', industry_type: 'Tech Hub', skills: ['Web Dev','Entrepreneurship','Digital Skills'], address: 'Ring Road, Benin City', lat: 6.3350, lon: 5.6199 },
  { name: 'Benin City Tech Collective', email: 'info@benintechcollective.com', industry_type: 'Software', skills: ['JavaScript','React','Mobile'], address: 'GRA, Benin City', lat: 6.3400, lon: 5.6300 },

  // CALABAR
  { name: 'Hubs Calabar', email: 'info@hubscalabar.com', industry_type: 'Tech Hub', skills: ['Digital Marketing','Web Dev','Design'], address: 'Calabar Municipality', lat: 4.9757, lon: 8.3417 },

  // JOS
  { name: 'Plateau Innovation Hub', email: 'info@plateauhub.ng', industry_type: 'Tech Hub', skills: ['Coding','Entrepreneurship','Design'], address: 'Jos', lat: 9.8965, lon: 8.8583 },

  // OWERRI
  { name: 'Owerri Innovation Hub', email: 'info@owerrihub.com.ng', industry_type: 'Tech Hub', skills: ['Web Dev','Mobile','Entrepreneurship'], address: 'Owerri, Imo State', lat: 5.4836, lon: 7.0333 },

  // UMUAHIA
  { name: 'TechUp Abia', email: 'info@techupabia.ng', industry_type: 'Tech Education', skills: ['Python','Web Dev','Digital Skills'], address: 'Umuahia, Abia State', lat: 5.5243, lon: 7.4892 },

  // AKURE
  { name: 'Ondo State Innovation Hub', email: 'info@ondostatehub.ng', industry_type: 'Tech Hub', skills: ['AgriTech','Web Dev','IoT'], address: 'Akure, Ondo State', lat: 7.2526, lon: 5.2100 },

  // WARRI
  { name: 'Delta Tech Hub', email: 'info@deltatechhub.ng', industry_type: 'Tech Hub', skills: ['Web Dev','Mobile Dev','Digital Marketing'], address: 'Effurun, Warri', lat: 5.5629, lon: 5.7811 },

  // ASABA
  { name: 'Asaba Tech Founders', email: 'info@asabatechfounders.com', industry_type: 'Startup Hub', skills: ['JavaScript','Entrepreneurship','Product'], address: 'Asaba, Delta State', lat: 6.1930, lon: 6.7360 },

  // ADDITIONAL COMPANIES FROM seed_companies.ts
  { name: 'Google', email: 'careers@google.com', industry_type: 'Technology', skills: ['Python', 'Java', 'Machine Learning', 'Data Structures'], address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043', lat: 37.422, lon: -122.0841 },
  { name: 'Microsoft', email: 'internships@microsoft.com', industry_type: 'Software Development', skills: ['C#', '.NET', 'Cloud Computing', 'TypeScript'], address: 'One Microsoft Way, Redmond, WA 98052', lat: 47.6422, lon: -122.1368 },
  { name: 'Paystack', email: 'careers@paystack.com', industry_type: 'Fintech', skills: ['Node.js', 'React', 'TypeScript', 'SQL'], address: '3A Ladoke Akintola, Ikeja GRA, Lagos, Nigeria', lat: 6.5862, lon: 3.3562 },
  { name: 'Andela', email: 'talent@andela.com', industry_type: 'Technology Services', skills: ['JavaScript', 'Python', 'React', 'Agile'], address: '235 Ikorodu Rd, Ilupeju, Lagos, Nigeria', lat: 6.548, lon: 3.366 },
  { name: 'Flutterwave', email: 'interns@flutterwavego.com', industry_type: 'Fintech', skills: ['Java', 'Go', 'React', 'Kubernetes'], address: '8 Providence Street, Lekki Phase 1, Lagos, Nigeria', lat: 6.446, lon: 3.472 },

  // ADDITIONAL COMPANIES FROM seed.js
  { name: "Paystack", email: "careers@paystack.com", industry_type: "FinTech", skills: ["React", "Node.js", "TypeScript", "Go", "SQL"], address: "Ikeja, Lagos", lat: 6.6018, lon: 3.3515 },
  { name: "Flutterwave", email: "hr@flutterwavego.com", industry_type: "FinTech", skills: ["Java", "Spring Boot", "React", "Cybersecurity", "Python"], address: "Lekki, Lagos", lat: 6.4382, lon: 3.4905 },
  { name: "Andela", email: "jobs@andela.com", industry_type: "Software Development", skills: ["React", "Python", "Django", "AWS", "Communication"], address: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "MTN Nigeria", email: "careers.ng@mtn.com", industry_type: "Telecommunications", skills: ["Networking", "Linux", "Telecommunications", "Data Analysis", "Project Management"], address: "Ikoyi, Lagos", lat: 6.4526, lon: 3.4293 },
  { name: "Interswitch", email: "careers@interswitchgroup.com", industry_type: "FinTech", skills: ["C#", ".NET", "SQL Server", "System Architecture", "Payment Systems"], address: "Victoria Island, Lagos", lat: 6.4281, lon: 3.4219 },
  { name: "Kuda Bank", email: "careers@kuda.com", industry_type: "Banking & Finance", skills: ["Kotlin", "Swift", "C#", "SQL", "Product Design"], address: "Yaba, Lagos", lat: 6.5054, lon: 3.3736 },
  { name: "PiggyVest", email: "careers@piggyvest.com", industry_type: "FinTech", skills: ["Node.js", "React", "MongoDB", "Marketing", "Customer Support"], address: "Victoria Island, Lagos", lat: 6.4253, lon: 3.4239 },
  { name: "Semicolon Africa", email: "hello@semicolon.africa", industry_type: "Education & Tech", skills: ["Java", "Python", "Design Thinking", "Problem Solving", "Web Development"], address: "Yaba, Lagos", lat: 6.5070, lon: 3.3740 },
  { name: "eTranzact", email: "hr@etranzact.com", industry_type: "Payment Systems", skills: ["Java", "Oracle", "Linux", "Cybersecurity", "Networking"], address: "Victoria Island, Lagos", lat: 6.4312, lon: 3.4300 },
  { name: "Seamfix", email: "careers@seamfix.com", industry_type: "Software Development", skills: ["Java", "React", "Android", "Data Analysis", "Biometrics"], address: "Lekki, Lagos", lat: 6.4428, lon: 3.4735 }
];
