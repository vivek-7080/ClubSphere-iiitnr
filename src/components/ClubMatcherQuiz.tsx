import React, { useState } from 'react';
import { Club } from '../types';
import { Sparkles, ArrowRight, RotateCcw, Check, Compass } from 'lucide-react';

interface ClubMatcherQuizProps {
  clubs: Club[];
  onSelectClub: (club: Club) => void;
  onApplyClub: (club: Club) => void;
}

export const ClubMatcherQuiz: React.FC<ClubMatcherQuizProps> = ({
  clubs,
  onSelectClub,
  onApplyClub,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{
    activityInterest: string;
    semesterGoal: string;
    timeCommitment: string;
    collaborationFormat: string;
  }>({
    activityInterest: '',
    semesterGoal: '',
    timeCommitment: '',
    collaborationFormat: '',
  });

  const questions = [
    {
      id: 'activityInterest',
      title: 'What activity sparks your deepest curiosity?',
      subtitle: 'Select the craft you want to sharpen outside regular university lectures.',
      options: [
        { id: 'code_ai', label: 'Algorithmic Coding, AI/ML & Web Development', targetClubs: ['tsoc', 'ingenuity', 'gdsc'] },
        { id: 'hardware_drones', label: 'Robotics, IoT Hardware & Drone Engineering', targetClubs: ['comet'] },
        { id: 'cybersecurity', label: 'Ethical Hacking, Penetration Testing & CTF War-Rooms', targetClubs: ['cipher'] },
        { id: 'performing_arts', label: 'Live Music (Cappricio), Dramatics (Club De Theatre) & Dance (Igniters)', targetClubs: ['cappricio', 'igniters', 'club-de-theatre'] },
        { id: 'fine_arts', label: 'Fine Arts, Sketches, Murals & Canvas (Indradhanush)', targetClubs: ['indradhanush'] },
        { id: 'photography', label: 'Photography, Drone Shoots & Cinema Editing (Shutterbug)', targetClubs: ['shutterbug'] },
        { id: 'debate_writing', label: 'Model UN, Parliamentary Debating & Literary Writing', targetClubs: ['sahitya'] },
        { id: 'startups', label: 'Venture Pitching, Startup Building & Seed Funding', targetClubs: ['ecell'] },
        { id: 'sports', label: 'Competitive Athletics, Football, Cricket & Fitness (Atharv)', targetClubs: ['atharv'] },
        { id: 'esports', label: 'Competitive Esports, Valorant, BGMI & LAN Tournaments (Atharv Esports)', targetClubs: ['atharv'] },
        { id: 'social_work', label: 'Rural School Education & Social Outreach', targetClubs: ['nss'] },
      ],
    },
    {
      id: 'semesterGoal',
      title: 'What is your primary goal this academic semester?',
      subtitle: 'How do you want this society to elevate your campus experience?',
      options: [
        { id: 'hackathons', label: 'Win national hackathons, CTFs & build tangible products', targetClubs: ['tsoc', 'cipher', 'ingenuity', 'comet'] },
        { id: 'stage', label: 'Perform on centerstage in front of hundreds at college fests', targetClubs: ['cappricio', 'igniters', 'club-de-theatre'] },
        { id: 'creative_craft', label: 'Exhibit fine art canvases or publish campus photography portfolios', targetClubs: ['indradhanush', 'shutterbug'] },
        { id: 'leadership', label: 'Hone executive leadership, diplomatic rhetoric & networking', targetClubs: ['sahitya', 'ecell', 'gdsc'] },
        { id: 'athletic', label: 'Compete for championship trophies in Inter-IIIT sports & esports meets', targetClubs: ['atharv'] },
        { id: 'grassroots', label: 'Create positive social change in rural Chhattisgarh', targetClubs: ['nss'] },
      ],
    },
    {
      id: 'timeCommitment',
      title: 'How much time can you comfortably commit weekly?',
      subtitle: 'Balance your coursework, hostel life, and extracurricular energy.',
      options: [
        { id: 'light', label: '2 to 4 Hours (Weekly jam sessions, art workshops)', targetClubs: ['shutterbug', 'indradhanush', 'sahitya', 'gdsc', 'nss'] },
        { id: 'moderate', label: '5 to 7 Hours (Regular project sprints, rehearsals & meetups)', targetClubs: ['tsoc', 'cipher', 'cappricio', 'igniters', 'club-de-theatre', 'ecell'] },
        { id: 'intensive', label: '8+ Hours (Deep competitive lab work & daily training)', targetClubs: ['atharv', 'comet', 'ingenuity'] },
      ],
    },
  ];

  const handleSelectOption = (questionKey: string, optionId: string) => {
    setAnswers({ ...answers, [questionKey]: optionId });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(questions.length); // Results step
    }
  };

  const resetQuiz = () => {
    setAnswers({
      activityInterest: '',
      semesterGoal: '',
      timeCommitment: '',
      collaborationFormat: '',
    });
    setCurrentStep(0);
  };

  // Deterministic matching algorithm based on weighted user selections
  const getTopMatches = () => {
    const scores: Record<string, number> = {};
    clubs.forEach((c) => (scores[c.id] = 10)); // Baseline score

    questions.forEach((q) => {
      const selectedOptId = (answers as any)[q.id];
      if (selectedOptId) {
        const optionObj = q.options.find((o) => o.id === selectedOptId);
        if (optionObj) {
          optionObj.targetClubs.forEach((clubId) => {
            scores[clubId] = (scores[clubId] || 10) + 30;
          });
        }
      }
    });

    const sortedClubIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    return sortedClubIds.slice(0, 3).map((id, index) => {
      const club = clubs.find((c) => c.id === id)!;
      const matchPercentage = 95 - index * 6 + (scores[id] % 5);
      return { club, matchPercentage };
    });
  };

  const isCompleted = currentStep >= questions.length;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Kicker & Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Student Quiz</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Find Your Tribe at IIIT Naya Raipur
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Answer 3 brief questions to instantly discover which campus societies match your creative passions, career trajectory, and weekly bandwidth.
        </p>
      </div>

      {!isCompleted ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-slate-800 pb-4">
            <span className="font-semibold text-amber-400">
              Question {currentStep + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    idx <= currentStep ? 'bg-amber-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {questions[currentStep].title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {questions[currentStep].subtitle}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions[currentStep].options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(questions[currentStep].id, opt.id)}
                className="group flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left transition-all hover:border-amber-400/80 hover:bg-slate-950"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 group-hover:border-amber-400 group-hover:bg-amber-400/10 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-transparent group-hover:bg-amber-400 transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white leading-snug">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="mt-6 flex justify-start border-t border-slate-800/80 pt-4">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to previous question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Compatibility Analysis Ready
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Your Recommended IIIT-NR Societies
              </h3>
            </div>

            <button
              onClick={resetQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors w-fit"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          {/* Recommended Clubs Cards */}
          <div className="mt-6 space-y-4">
            {getTopMatches().map(({ club, matchPercentage }, rank) => (
              <div
                key={club.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 transition-all hover:border-slate-700 hover:bg-slate-950"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-base text-slate-950 shadow"
                      style={{ backgroundColor: club.accentColor }}
                    >
                      {club.acronym}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-amber-400">#{rank + 1} Best Match</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-emerald-400 font-bold">{matchPercentage}% Match</span>
                        <span aria-hidden="true">·</span>
                        <span>{club.categoryLabel}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {club.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-2">
                        {club.description}
                      </p>
                      <div className="mt-2 text-xs text-slate-400">
                        <span className="text-slate-500">Venue: </span>
                        <span>{club.meetingVenue}</span>
                        <span className="mx-2 text-slate-700">·</span>
                        <span className="text-slate-500">Strength: </span>
                        <span className="font-mono tabular-nums text-slate-300">{club.membersCount} Members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onSelectClub(club)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span>Overview</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onApplyClub(club)}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
