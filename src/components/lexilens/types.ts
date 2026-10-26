export type ReadingLevel = 'original' | 'easy' | 'easiest';

export interface ReaderSettings {
  fontSize: number; // px
  lineHeight: number;
  letterSpacing: number; // em
  wordSpacing: number; // em
  paraSpacing: number; // em
  font: 'sans' | 'atkinson' | 'dyslexic';
  theme: 'paper' | 'cream' | 'mint' | 'night' | 'contrast';
  focusMode: boolean;
  ruler: boolean;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 22,
  lineHeight: 1.9,
  letterSpacing: 0.04,
  wordSpacing: 0.12,
  paraSpacing: 1.2,
  font: 'atkinson',
  theme: 'cream',
  focusMode: false,
  ruler: false,
};

export interface SampleText {
  id: string;
  label: string;
  title: string;
  source: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'medical',
    label: 'Medicine label',
    title: 'Prescription instructions',
    source: 'Typical pharmacy leaflet',
    text: `Take this medication orally with or without food as directed by your physician, typically every 12 hours. The dosage prescribed is contingent upon your medical condition, hepatic function, and therapeutic response to treatment.

Do not discontinue this medication without first consulting your healthcare provider, as abrupt cessation may precipitate withdrawal symptomatology.

Patients should be apprised of potential adverse reactions including but not limited to gastrointestinal disturbances, photosensitivity, and dizziness.

In the event that a dose is inadvertently omitted, administer it as expeditiously as possible unless the subsequent scheduled dose is imminent, in which case the omitted dose should be forgone entirely.`,
  },
  {
    id: 'legal',
    label: 'Rental agreement',
    title: 'Lease agreement, clause 4',
    source: 'Standard residential lease',
    text: `Lessee hereby covenants and agrees to indemnify, defend, and hold harmless Lessor from and against any and all claims, damages, or liabilities arising from Lessee's occupancy of the demised premises. Notwithstanding any provision contained herein to the contrary, Lessor shall not be liable for incidental or consequential damages occasioned by Lessor's negligence. This agreement shall be construed in accordance with the laws of the applicable jurisdiction, and any provision adjudicated unenforceable shall not invalidate the remaining provisions hereof. Lessee's failure to comply with the covenants herein enumerated shall constitute a material breach, whereupon Lessor may pursue all remedies available at law or in equity.`,
  },
  {
    id: 'science',
    label: 'Science news',
    title: 'Climate report summary',
    source: 'Condensed research abstract',
    text: `Anthropogenic greenhouse gas emissions have precipitated an average increase in global surface temperatures of approximately 1.1 degrees Celsius relative to pre-industrial baselines. This warming trajectory is concomitant with augmented frequency and intensity of extreme precipitation events, protracted drought conditions, and thermal anomalies disproportionately affecting vulnerable populations. Mitigation scenarios consistent with limiting warming to 1.5 degrees Celsius necessitate an exponential acceleration in the decarbonization of energy infrastructure, alongside the widespread deployment of carbon dioxide removal technologies.`,
  },
  {
    id: 'terms',
    label: 'Terms of service',
    title: 'App terms of service, section 7',
    source: 'Everyday app you clicked "agree" on',
    text: `The licensor reserves the right to modify, suspend, or discontinue any aspect of the service at its sole discretion, with or without prior notification. By continuing to utilize the service subsequent to the promulgation of revisions, the user thereby signifies assent to the amended terms. All user-generated content submitted to the platform hereby grants the licensor a perpetual, irrevocable, worldwide, royalty-free license to reproduce, distribute, and create derivative works therefrom. The user assumes exclusive responsibility for maintaining the confidentiality of authentication credentials.`,
  },
];

export const DEMO_BEFORE =
  'Patients should be apprised of potential adverse reactions including gastrointestinal disturbances.';

export const DEMO_AFTER =
  'This medicine can make you feel sick in your stomach. Your doctor will tell you what to watch for.';
