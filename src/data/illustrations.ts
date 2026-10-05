export interface IllustrationItem {
  id: string;
  title: string;
  category: string;
  lineArtSvg: string;
  coloredSvg: string;
}

export const PRESET_ILLUSTRATIONS: IllustrationItem[] = [
  {
    id: 'doctor-checkup',
    title: 'Listen to My Heart / فحص الطبيب',
    category: 'Medical & Health',
    lineArtSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="800" height="650" fill="#FFFFFF"/>
      
      <!-- Background wall art & window -->
      <g stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <!-- Wall line & cabinet -->
        <line x1="20" y1="420" x2="780" y2="420" />
        
        <!-- Medical poster on left wall -->
        <rect x="50" y="70" width="160" height="230" rx="8" />
        <path d="M130 110 C105 75 70 100 70 135 C70 175 130 220 130 220 C130 220 190 175 190 135 C190 100 155 75 130 110 Z" />
        <!-- Face inside poster heart -->
        <circle cx="115" cy="135" r="4" fill="#1e293b" />
        <circle cx="145" cy="135" r="4" fill="#1e293b" />
        <path d="M122 150 Q130 158 138 150" fill="none" />
        <!-- Pulse graph line -->
        <path d="M60 260 L90 260 L105 235 L120 280 L135 245 L150 260 L200 260" fill="none" />

        <!-- Window on right wall -->
        <rect x="590" y="50" width="160" height="200" rx="6" />
        <path d="M610 180 C610 150 635 140 655 150 C670 120 710 125 725 155 C740 155 745 180 735 190 Z" />

        <!-- Cabinet & Medical Jar on table -->
        <rect x="570" y="380" width="200" height="210" rx="6" />
        <line x1="585" y1="440" x2="755" y2="440" />
        <circle cx="670" cy="410" r="5" fill="#1e293b"/>
        <line x1="585" y1="510" x2="755" y2="510" />
        <circle cx="670" cy="480" r="5" fill="#1e293b"/>

        <!-- Swab jar & Medicine bottle on table -->
        <rect x="600" y="320" width="60" height="60" rx="8" />
        <path d="M610 320 L610 285 Q615 275 620 285 L620 320" />
        <path d="M625 320 L625 275 Q630 265 635 275 L635 320" />
        <path d="M640 320 L640 285 Q645 275 650 285 L650 320" />
        
        <rect x="680" y="305" width="55" height="75" rx="10" />
        <rect x="693" y="290" width="30" height="15" rx="4" />
        <path d="M708 330 V350 M698 340 H718" stroke-width="5" />
      </g>

      <!-- Examination Bed -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 460 Q30 430 60 430 L380 430 Q410 430 410 460 L410 540 L30 540 Z" />
        <path d="M40 540 L40 620 M120 540 L120 620 M380 540 L380 620" stroke-width="6" />
        <line x1="40" y1="590" x2="380" y2="590" stroke-width="4" />
        <!-- Bed cushion pillow -->
        <path d="M30 480 Q70 470 120 480" stroke-width="4" />
      </g>

      <!-- The Child (Patient) -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Hair & Face -->
        <path d="M210 250 C180 230 170 190 190 160 C210 130 250 120 290 140 C320 120 350 145 345 180 C365 190 365 230 340 250" fill="none" />
        <path d="M200 230 C190 270 210 320 260 325 C310 325 330 280 325 240" fill="none" />
        <!-- Ear -->
        <path d="M190 240 Q180 255 195 270" />
        <!-- Eyes & Smile -->
        <ellipse cx="235" cy="245" rx="8" ry="12" fill="#1e293b" />
        <ellipse cx="285" cy="245" rx="8" ry="12" fill="#1e293b" />
        <circle cx="238" cy="240" r="3" fill="#ffffff" />
        <circle cx="288" cy="240" r="3" fill="#ffffff" />
        <path d="M250 265 Q260 270 270 265" />
        <path d="M240 285 Q260 315 285 285 Z" fill="#1e293b" />
        <!-- Cheeks -->
        <path d="M215 270 Q225 270 225 265" stroke-width="3" />
        <path d="M295 270 Q305 270 305 265" stroke-width="3" />

        <!-- Child Body & T-Shirt -->
        <path d="M230 325 L200 375 L215 440 L310 440 L320 375 L290 325 Z" />
        <path d="M200 375 L170 410 L190 425 L210 395" />
        <!-- Left arm resting on exam bed -->
        <path d="M185 425 L165 480 Q160 505 185 500 L205 480" />
        <!-- Right arm on chest/knee -->
        <path d="M310 385 L325 435 L300 455" />

        <!-- Shorts & Legs -->
        <path d="M215 440 L205 510 L250 515 L260 470 L270 515 L315 510 L305 440 Z" />
        <!-- Legs & Sneakers -->
        <path d="M220 515 L225 570 L260 570 L250 515" />
        <path d="M280 515 L275 570 L305 570 L310 515" />
        <!-- Shoes -->
        <path d="M210 580 C210 565 240 560 265 570 C280 580 270 615 235 615 C210 615 205 595 210 580 Z" />
        <path d="M275 580 C275 565 305 560 330 570 C345 580 335 615 300 615 C275 615 270 595 275 580 Z" />
      </g>

      <!-- Doctor (Female Doctor) -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Ponytail & Hair -->
        <path d="M470 120 C420 120 390 160 410 220 C430 270 480 280 530 260 C580 240 585 180 560 140 C530 110 490 115 470 120 Z" />
        <path d="M560 180 C600 170 650 200 635 260 C620 300 580 280 560 250" />
        
        <!-- Doctor Face -->
        <path d="M425 210 C420 260 450 290 495 285 C540 280 555 240 550 205" />
        <!-- Doctor Ear & Earpiece -->
        <path d="M545 205 Q560 215 550 230" />
        <circle cx="545" cy="220" r="5" fill="#1e293b" />

        <!-- Doctor Eyes & Smile -->
        <ellipse cx="460" cy="205" rx="7" ry="10" fill="#1e293b" />
        <ellipse cx="510" cy="200" rx="7" ry="10" fill="#1e293b" />
        <circle cx="463" cy="200" r="2.5" fill="#ffffff" />
        <circle cx="513" cy="195" r="2.5" fill="#ffffff" />
        <path d="M475 225 Q485 230 495 225" />
        <path d="M470 245 Q495 275 520 245" fill="#1e293b" />
        <!-- Eyebrows -->
        <path d="M448 190 Q465 182 475 190" stroke-width="4" />
        <path d="M500 185 Q518 178 528 185" stroke-width="4" />

        <!-- Doctor Coat & Clothes -->
        <path d="M460 290 L400 370 L425 615 L590 615 L660 480 L620 350 L560 290 Z" />
        <!-- Coat Lapels -->
        <path d="M480 300 L495 380 L440 440 L445 615" />
        <path d="M525 300 L515 380 L555 450 L545 615" />
        <!-- Pocket on doctor coat -->
        <rect x="555" y="460" width="55" height="65" rx="6" />

        <!-- Doctor Arm holding stethoscope to boy's heart -->
        <path d="M430 370 L340 435 L330 465 L360 470 L420 420" />
        <!-- Stethoscope chest piece in hand on boy's chest -->
        <circle cx="320" cy="460" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="5" />
        <circle cx="320" cy="460" r="6" fill="#1e293b" />

        <!-- Stethoscope tubes from ears to chest piece -->
        <path d="M545 220 C540 270 480 340 420 350 C360 360 325 430 320 446" fill="none" stroke-width="5" />
      </g>
    </svg>`,
    coloredSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="650" fill="#f0fdf4"/>
      <!-- Soft clinic room background -->
      <rect x="0" y="0" width="800" height="420" fill="#e0f2fe"/>
      <rect x="0" y="420" width="800" height="230" fill="#f8fafc"/>
      
      <!-- Poster -->
      <rect x="50" y="70" width="160" height="230" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="4"/>
      <path d="M130 110 C105 75 70 100 70 135 C70 175 130 220 130 220 C130 220 190 175 190 135 C190 100 155 75 130 110 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
      <circle cx="115" cy="135" r="4" fill="#ffffff"/>
      <circle cx="145" cy="135" r="4" fill="#ffffff"/>
      <path d="M122 150 Q130 158 138 150" stroke="#ffffff" stroke-width="3" fill="none"/>
      <path d="M60 260 L90 260 L105 235 L120 280 L135 245 L150 260 L200 260" stroke="#ef4444" stroke-width="4" fill="none"/>

      <!-- Window -->
      <rect x="590" y="50" width="160" height="200" rx="6" fill="#bae6fd" stroke="#0284c7" stroke-width="4"/>
      <path d="M610 180 C610 150 635 140 655 150 C670 120 710 125 725 155 C740 155 745 180 735 190 Z" fill="#ffffff"/>

      <!-- Cabinet & Jars -->
      <rect x="570" y="380" width="200" height="210" rx="6" fill="#f1f5f9" stroke="#64748b" stroke-width="4"/>
      <circle cx="670" cy="410" r="6" fill="#0284c7"/>
      <circle cx="670" cy="480" r="6" fill="#0284c7"/>
      <rect x="600" y="320" width="60" height="60" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="3"/>
      <rect x="680" y="305" width="55" height="75" rx="10" fill="#fecdd3" stroke="#e11d48" stroke-width="3"/>
      <path d="M708 330 V350 M698 340 H718" stroke="#e11d48" stroke-width="5"/>

      <!-- Exam Bed -->
      <path d="M30 460 Q30 430 60 430 L380 430 Q410 430 410 460 L410 540 L30 540 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="4"/>
      <path d="M40 540 L40 620 M120 540 L120 620 M380 540 L380 620" stroke="#0f172a" stroke-width="6"/>

      <!-- Boy -->
      <!-- Hair -->
      <path d="M210 250 C180 230 170 190 190 160 C210 130 250 120 290 140 C320 120 350 145 345 180 C365 190 365 230 340 250 Z" fill="#78350f"/>
      <!-- Face -->
      <path d="M200 230 C190 270 210 320 260 325 C310 325 330 280 325 240 Z" fill="#fde68a"/>
      <ellipse cx="235" cy="245" rx="7" ry="11" fill="#1e293b"/>
      <ellipse cx="285" cy="245" rx="7" ry="11" fill="#1e293b"/>
      <path d="M240 285 Q260 315 285 285 Z" fill="#ef4444"/>
      <!-- Clothes -->
      <path d="M230 325 L200 375 L215 440 L310 440 L320 375 L290 325 Z" fill="#0ea5e9" stroke="#0369a1" stroke-width="3"/>
      <path d="M215 440 L205 510 L250 515 L260 470 L270 515 L315 510 L305 440 Z" fill="#1e293b"/>
      <!-- Legs & Shoes -->
      <path d="M220 515 L225 570 L260 570 L250 515" fill="#fde68a"/>
      <path d="M280 515 L275 570 L305 570 L310 515" fill="#fde68a"/>
      <path d="M210 580 C210 565 240 560 265 570 C280 580 270 615 235 615 C210 615 205 595 210 580 Z" fill="#ef4444"/>
      <path d="M275 580 C275 565 305 560 330 570 C345 580 335 615 300 615 C275 615 270 595 275 580 Z" fill="#ef4444"/>

      <!-- Doctor -->
      <path d="M470 120 C420 120 390 160 410 220 C430 270 480 280 530 260 C580 240 585 180 560 140 C530 110 490 115 470 120 Z" fill="#92400e"/>
      <path d="M560 180 C600 170 650 200 635 260 C620 300 580 280 560 250 Z" fill="#92400e"/>
      <path d="M425 210 C420 260 450 290 495 285 C540 280 555 240 550 205 Z" fill="#fef08a"/>
      <ellipse cx="460" cy="205" rx="7" ry="10" fill="#1e293b"/>
      <ellipse cx="510" cy="200" rx="7" ry="10" fill="#1e293b"/>
      <path d="M470 245 Q495 275 520 245" fill="#ef4444"/>
      <!-- Doctor Coat -->
      <path d="M460 290 L400 370 L425 615 L590 615 L660 480 L620 350 L560 290 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="4"/>
      <!-- Stethoscope -->
      <path d="M545 220 C540 270 480 340 420 350 C360 360 325 430 320 446" fill="none" stroke="#0284c7" stroke-width="6"/>
      <circle cx="320" cy="460" r="14" fill="#e2e8f0" stroke="#0284c7" stroke-width="4"/>
    </svg>`
  },
  {
    id: 'mail-carrier',
    title: 'Community Helpers / ساعي البريد',
    category: 'Community & Jobs',
    lineArtSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="800" height="650" fill="#FFFFFF"/>
      
      <!-- House, Mailbox & Nature in background -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- House entrance & door -->
        <rect x="25" y="160" width="180" height="420" rx="6" />
        <path d="M20 165 L115 80 L210 165 Z" />
        <rect x="45" y="240" width="110" height="320" rx="4" />
        <rect x="55" y="260" width="90" height="120" rx="4" />
        <circle cx="140" cy="410" r="6" fill="#1e293b" />
        
        <!-- Mailbox on post -->
        <rect x="670" y="320" width="90" height="90" rx="45" />
        <rect x="655" y="360" width="20" height="50" rx="4" />
        <line x1="710" y1="410" x2="710" y2="600" stroke-width="8" />
        <!-- Flag on mailbox -->
        <path d="M720 340 L760 340 L760 310" stroke-width="5" />

        <!-- Fence & Bushes -->
        <path d="M200 480 C240 440 300 440 340 480 C380 440 440 450 470 500" />
        <path d="M530 520 C580 480 640 490 680 540" />
        <path d="M600 80 C630 40 700 40 730 80 C770 100 780 160 740 200 C700 230 640 210 610 170 Z" />

        <!-- Ground / Path -->
        <line x1="20" y1="580" x2="780" y2="580" stroke-width="6" />
      </g>

      <!-- Boy with backpack receiving mail -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Backpack -->
        <path d="M190 480 C160 480 160 560 190 580 Z" />
        <!-- Hair & Face -->
        <path d="M185 300 C155 280 165 230 205 225 C230 200 280 205 295 240 C325 245 330 290 300 320" />
        <path d="M195 300 C185 350 220 395 270 395 C310 395 320 350 310 310" />
        <ellipse cx="240" cy="315" rx="8" ry="12" fill="#1e293b" />
        <ellipse cx="285" cy="315" rx="8" ry="12" fill="#1e293b" />
        <circle cx="243" cy="310" r="3" fill="#ffffff" />
        <circle cx="288" cy="310" r="3" fill="#ffffff" />
        <path d="M250 355 Q265 375 280 355" fill="#1e293b" />

        <!-- Boy Waving Hand -->
        <path d="M295 400 L340 430 L370 390 C380 380 400 405 385 420 L350 455" />
        
        <!-- Boy Clothes & Legs -->
        <path d="M210 395 L190 460 L230 520 L300 520 L330 460 L300 395 Z" />
        <path d="M225 520 L220 575 L260 575 L255 520" />
        <path d="M280 520 L275 575 L315 575 L310 520" />
        <path d="M210 585 C210 570 240 565 265 575 C280 585 270 615 235 615 C210 615 205 600 210 585 Z" />
        <path d="M270 585 C270 570 300 565 325 575 C340 585 330 615 295 615 C270 615 265 600 270 585 Z" />
      </g>

      <!-- Mail Carrier (Postman) -->
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Postman Cap -->
        <path d="M465 190 C450 160 510 120 600 130 C645 135 680 170 670 200 Z" />
        <path d="M460 195 C430 200 440 225 485 220 L665 210" stroke-width="6" />
        <rect x="555" y="150" width="30" height="20" rx="4" />
        <path d="M558 153 L570 162 L582 153" />

        <!-- Face & Hair -->
        <path d="M490 220 C480 270 510 315 565 310 C615 305 635 265 625 220" />
        <ellipse cx="530" cy="245" rx="8" ry="12" fill="#1e293b" />
        <ellipse cx="585" cy="240" rx="8" ry="12" fill="#1e293b" />
        <circle cx="533" cy="240" r="3" fill="#ffffff" />
        <circle cx="588" cy="235" r="3" fill="#ffffff" />
        <path d="M545 275 Q565 295 585 275" fill="#1e293b" />

        <!-- Uniform Body & Shoulder Satchel -->
        <path d="M510 320 L445 420 L490 570 L640 570 L675 420 L615 320 Z" />
        <!-- Handing Letter to Boy -->
        <path d="M470 410 L380 440 L370 480 L440 485 L480 440" />
        <!-- Big Envelope in hand -->
        <rect x="375" y="415" width="105" height="70" rx="6" fill="#ffffff" stroke="#1e293b" stroke-width="5" transform="rotate(-15 375 415)" />
        <path d="M370 410 L425 450 L470 395" stroke-width="4" />

        <!-- Satchel Bag on Hip -->
        <path d="M580 320 L640 480" stroke-width="6" />
        <rect x="600" y="470" width="120" height="110" rx="14" />
        <path d="M600 485 L660 535 L720 485" stroke-width="5" />
        <!-- Legs & Shoes -->
        <path d="M520 570 L520 620 L570 620 L570 570" />
        <path d="M590 570 L590 620 L640 620 L640 570" />
      </g>
    </svg>`,
    coloredSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="650" fill="#f5f3ff"/>
      <rect x="0" y="0" width="800" height="420" fill="#ede9fe"/>
      <rect x="0" y="420" width="800" height="230" fill="#dcfce7"/>

      <!-- House -->
      <rect x="25" y="160" width="180" height="420" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="4"/>
      <path d="M20 165 L115 80 L210 165 Z" fill="#ea580c"/>
      <rect x="45" y="240" width="110" height="320" rx="4" fill="#ffffff" stroke="#9a3412" stroke-width="3"/>

      <!-- Mailbox -->
      <rect x="670" y="320" width="90" height="90" rx="45" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4"/>
      <line x1="710" y1="410" x2="710" y2="600" stroke="#475569" stroke-width="8"/>
      <path d="M720 340 L760 340 L760 310" stroke="#ef4444" stroke-width="6"/>

      <!-- Bushes & Tree -->
      <path d="M200 480 C240 440 300 440 340 480 C380 440 440 450 470 500 Z" fill="#22c55e"/>
      <path d="M530 520 C580 480 640 490 680 540 Z" fill="#16a34a"/>
      <path d="M600 80 C630 40 700 40 730 80 C770 100 780 160 740 200 C700 230 640 210 610 170 Z" fill="#4ade80"/>

      <!-- Boy -->
      <path d="M190 480 C160 480 160 560 190 580 Z" fill="#ef4444"/>
      <path d="M185 300 C155 280 165 230 205 225 C230 200 280 205 295 240 C325 245 330 290 300 320 Z" fill="#b45309"/>
      <path d="M195 300 C185 350 220 395 270 395 C310 395 320 350 310 310 Z" fill="#fde68a"/>
      <path d="M210 395 L190 460 L230 520 L300 520 L330 460 L300 395 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
      <ellipse cx="240" cy="315" rx="7" ry="11" fill="#1e293b"/>
      <ellipse cx="285" cy="315" rx="7" ry="11" fill="#1e293b"/>
      <path d="M250 355 Q265 375 280 355" fill="#ef4444"/>

      <!-- Postman -->
      <path d="M465 190 C450 160 510 120 600 130 C645 135 680 170 670 200 Z" fill="#2563eb"/>
      <path d="M460 195 C430 200 440 225 485 220 L665 210 Z" fill="#1e3a8a"/>
      <path d="M490 220 C480 270 510 315 565 310 C615 305 635 265 625 220 Z" fill="#fef08a"/>
      <path d="M510 320 L445 420 L490 570 L640 570 L675 420 L615 320 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4"/>
      <rect x="600" y="470" width="120" height="110" rx="14" fill="#92400e" stroke="#78350f" stroke-width="4"/>
      <!-- Letter -->
      <rect x="375" y="415" width="105" height="70" rx="6" fill="#ffffff" stroke="#1e293b" stroke-width="4" transform="rotate(-15 375 415)"/>
    </svg>`
  },
  {
    id: 'space-astronaut',
    title: 'Space Explorer / رائد الفضاء',
    category: 'Adventure',
    lineArtSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="800" height="650" fill="#FFFFFF"/>
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Moon surface -->
        <path d="M0 520 Q400 460 800 520 L800 650 L0 650 Z" />
        <ellipse cx="200" cy="560" rx="40" ry="15" />
        <ellipse cx="550" cy="580" rx="60" ry="20" />
        <ellipse cx="700" cy="540" rx="30" ry="10" />

        <!-- Planets & Stars in sky -->
        <circle cx="150" cy="140" r="50" />
        <ellipse cx="150" cy="140" rx="80" ry="15" transform="rotate(-20 150 140)" />
        <circle cx="680" cy="120" r="35" />
        
        <!-- Rocket Ship -->
        <path d="M680 260 Q650 320 630 380 L670 380 L690 410 L710 380 L750 380 Q730 320 700 260 Z" />
        <circle cx="690" cy="320" r="15" />
        <path d="M620 380 L590 430 L635 415" />
        <path d="M760 380 L790 430 L745 415" />

        <!-- Astronaut -->
        <!-- Helmet -->
        <circle cx="400" cy="240" r="95" stroke-width="6" />
        <ellipse cx="400" cy="240" rx="65" ry="50" fill="#ffffff" stroke-width="6" />
        <!-- Face inside helmet -->
        <ellipse cx="380" cy="235" rx="7" ry="10" fill="#1e293b" />
        <ellipse cx="420" cy="235" rx="7" ry="10" fill="#1e293b" />
        <circle cx="383" cy="230" r="2.5" fill="#ffffff" />
        <circle cx="423" cy="230" r="2.5" fill="#ffffff" />
        <path d="M390 260 Q400 270 410 260" />

        <!-- Spacesuit -->
        <path d="M330 330 L310 460 L490 460 L470 330 Z" stroke-width="6" />
        <rect x="365" y="360" width="70" height="60" rx="8" />
        <circle cx="385" cy="385" r="8" fill="#1e293b" />
        <circle cx="415" cy="385" r="8" fill="#1e293b" />

        <!-- Arms & Legs -->
        <path d="M320 350 L250 400 L270 430 L315 390" />
        <path d="M480 350 L550 400 L530 430 L485 390" />
        <path d="M340 460 L330 550 L390 550 L395 460" />
        <path d="M460 460 L470 550 L410 550 L405 460" />
        <rect x="310" y="550" width="80" height="30" rx="10" />
        <rect x="410" y="550" width="80" height="30" rx="10" />
      </g>
    </svg>`,
    coloredSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="650" fill="#0f172a"/>
      <!-- Moon surface -->
      <path d="M0 520 Q400 460 800 520 L800 650 L0 650 Z" fill="#64748b"/>
      <ellipse cx="200" cy="560" rx="40" ry="15" fill="#475569"/>
      <ellipse cx="550" cy="580" rx="60" ry="20" fill="#475569"/>
      
      <!-- Saturn planet -->
      <circle cx="150" cy="140" r="50" fill="#f59e0b"/>
      <ellipse cx="150" cy="140" rx="80" ry="15" fill="none" stroke="#fde68a" stroke-width="8" transform="rotate(-20 150 140)"/>
      <circle cx="680" cy="120" r="35" fill="#ec4899"/>

      <!-- Rocket -->
      <path d="M680 260 Q650 320 630 380 L670 380 L690 410 L710 380 L750 380 Q730 320 700 260 Z" fill="#f8fafc"/>
      <path d="M670 380 L690 440 L710 380 Z" fill="#f97316"/>

      <!-- Astronaut -->
      <circle cx="400" cy="240" r="95" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="4"/>
      <ellipse cx="400" cy="240" rx="65" ry="50" fill="#38bdf8"/>
      <path d="M330 330 L310 460 L490 460 L470 330 Z" fill="#ffffff"/>
      <rect x="365" y="360" width="70" height="60" rx="8" fill="#e2e8f0"/>
      <circle cx="385" cy="385" r="8" fill="#ef4444"/>
      <circle cx="415" cy="385" r="8" fill="#3b82f6"/>
      <rect x="310" y="550" width="80" height="30" rx="10" fill="#334155"/>
      <rect x="410" y="550" width="80" height="30" rx="10" fill="#334155"/>
    </svg>`
  },
  {
    id: 'cute-animals',
    title: 'Garden Animals / حيوانات الحديقة',
    category: 'Nature & Animals',
    lineArtSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="800" height="650" fill="#FFFFFF"/>
      <g stroke="#1e293b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Sun & Clouds -->
        <circle cx="120" cy="120" r="45" />
        <path d="M120 50 V65 M120 175 V190 M50 120 H65 M175 120 H190" stroke-width="6" />
        <path d="M620 130 C600 110 560 110 540 130 C520 120 490 140 500 170 C500 190 640 190 640 170 Z" />

        <!-- Ground & Flowers -->
        <path d="M0 500 Q400 480 800 500 L800 650 L0 650 Z" />
        <!-- Big Flower -->
        <circle cx="130" cy="460" r="18" />
        <circle cx="130" cy="425" r="16" />
        <circle cx="130" cy="495" r="16" />
        <circle cx="95" cy="460" r="16" />
        <circle cx="165" cy="460" r="16" />
        <line x1="130" y1="510" x2="130" y2="580" stroke-width="6" />

        <!-- Cute Bear in center -->
        <!-- Ears -->
        <circle cx="340" cy="270" r="35" />
        <circle cx="340" cy="270" r="20" />
        <circle cx="460" cy="270" r="35" />
        <circle cx="460" cy="270" r="20" />
        <!-- Head -->
        <circle cx="400" cy="330" r="85" stroke-width="6" />
        <!-- Snout -->
        <ellipse cx="400" cy="355" rx="40" ry="30" />
        <ellipse cx="400" cy="345" rx="15" ry="10" fill="#1e293b" />
        <path d="M400 355 V370 M385 370 Q400 380 415 370" />
        <!-- Eyes -->
        <ellipse cx="370" cy="315" rx="8" ry="12" fill="#1e293b" />
        <ellipse cx="430" cy="315" rx="8" ry="12" fill="#1e293b" />
        <circle cx="373" cy="310" r="3" fill="#ffffff" />
        <circle cx="433" cy="310" r="3" fill="#ffffff" />

        <!-- Bear Body & Paws holding heart -->
        <path d="M330 400 C310 460 320 540 340 570 L460 570 C480 540 490 460 470 400 Z" stroke-width="6" />
        <path d="M400 440 C380 410 350 430 350 460 C350 490 400 520 400 520 C400 520 450 490 450 460 C450 430 420 410 400 440 Z" stroke-width="5" />
        <!-- Paws -->
        <ellipse cx="340" cy="465" rx="20" ry="15" />
        <ellipse cx="460" cy="465" rx="20" ry="15" />
      </g>
    </svg>`,
    coloredSvg: `<svg viewBox="0 0 800 650" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="650" fill="#f0fdf4"/>
      <path d="M0 500 Q400 480 800 500 L800 650 L0 650 Z" fill="#86efac"/>
      <circle cx="120" cy="120" r="45" fill="#fde047"/>

      <!-- Flower -->
      <circle cx="130" cy="460" r="18" fill="#facc15"/>
      <circle cx="130" cy="425" r="16" fill="#f43f5e"/>
      <circle cx="130" cy="495" r="16" fill="#f43f5e"/>
      <circle cx="95" cy="460" r="16" fill="#f43f5e"/>
      <circle cx="165" cy="460" r="16" fill="#f43f5e"/>

      <!-- Bear -->
      <circle cx="340" cy="270" r="35" fill="#b45309"/>
      <circle cx="460" cy="270" r="35" fill="#b45309"/>
      <circle cx="400" cy="330" r="85" fill="#d97706"/>
      <ellipse cx="400" cy="355" rx="40" ry="30" fill="#fef3c7"/>
      <path d="M330 400 C310 460 320 540 340 570 L460 570 C480 540 490 460 470 400 Z" fill="#d97706"/>
      <path d="M400 440 C380 410 350 430 350 460 C350 490 400 520 400 520 C400 520 450 490 450 460 C450 430 420 410 400 440 Z" fill="#ef4444"/>
    </svg>`
  }
];
