import { ArrowLeft, ExternalLink } from 'lucide-react';
import BrandLink from '../components/BrandLink';

const posters = [
  { src: '/information/competition-information.png', title: 'Competition Information', description: 'Format, venue, registration, awards and rules', alt: 'Official 2026/2027 competition information including format, venue, registration, awards, jerseys and rules' },
  { src: '/information/participating-departments.png', title: 'Participating Departments', description: 'All 16 participating departments', alt: 'Official participating departments for the 2026/2027 final year tournament' },
  { src: '/information/group-stages.png', title: 'Group Stage Fixtures', description: 'Matchdays, groups and fixture times', alt: 'Official group-stage fixtures and group allocation information' },
  { src: '/information/road-to-final.png', title: 'Road to the Final', description: 'Quarter-finals, semi-finals and final', alt: 'Official road-to-final knockout bracket', wide: true },
];

export default function InformationPage() {
  return <main className="information-page"><header className="information-topbar"><BrandLink /><a className="information-back" href="/"><ArrowLeft size={16} /> Back to registration</a></header><div className="information-page-content"><div className="information-heading"><span>Official competition guide</span><h1>Competition Information</h1><p>Select any poster to open the original full-resolution image.</p></div><section className="information-gallery" aria-label="Competition information posters">{posters.map((poster) => <a key={poster.src} className={`information-poster${poster.wide ? ' information-wide' : ''}`} href={poster.src} target="_blank" rel="noreferrer"><img src={poster.src} alt={poster.alt} /><span><b>{poster.title}</b><small>{poster.description}</small><ExternalLink size={14} aria-hidden="true" /></span></a>)}</section></div></main>;
}
