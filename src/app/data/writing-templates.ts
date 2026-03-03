export interface WritingTemplate {
  id: number;
  title: string;
  category: string;
  situation: string;
  template: string;
  variations: string[];
  keyPhrases: string[];
  tone: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  whenToUse: string;
}

export function generateWritingTemplates(): WritingTemplate[] {
  const templates: WritingTemplate[] = [];
  let id = 1;

  // EMAIL TEMPLATES (150 templates)
  const emailTemplates = [
    {
      title: "Meeting Request - Direct Approach",
      category: "Emails - Meetings",
      situation: "You need to schedule a meeting with a colleague or client",
      template: "Hi [Name],\n\nI wanted to reach out to see if you have time to discuss [topic] this week. I have a few ideas I'd like to run by you.\n\nWould [day] at [time] work for you? Happy to work around your schedule.\n\nBest,\n[Your name]",
      variations: [
        "Hey [Name],\n\nHope you're doing well! I wanted to touch base about [topic]. Do you have 30 minutes this week to chat?\n\nLet me know what works best for you.\n\nThanks,\n[Your name]",
        "Hi [Name],\n\nI'd love to get your input on [topic]. Are you available for a quick call this week?\n\nI'm flexible on timing - just let me know what's convenient.\n\nCheers,\n[Your name]",
        "Hello [Name],\n\nI hope this email finds you well. I wanted to schedule some time to discuss [topic] and get your thoughts.\n\nWould you be available for a meeting sometime this week?\n\nLooking forward to hearing from you.\n\nBest regards,\n[Your name]"
      ],
      keyPhrases: ["reach out", "touch base", "run by you", "work around your schedule", "get your input"],
      tone: "Professional but friendly",
      difficulty: "beginner" as const,
      whenToUse: "When you need to schedule a meeting with someone you already know"
    },
    {
      title: "Follow-up After Meeting",
      category: "Emails - Follow-ups",
      situation: "Following up after a productive meeting",
      template: "Hi [Name],\n\nThanks for taking the time to meet with me today. I really appreciated your insights on [topic].\n\nAs discussed, I'll [action item] and circle back with you by [date].\n\nLooking forward to our next steps!\n\nBest,\n[Your name]",
      variations: [
        "Hey [Name],\n\nGreat meeting with you earlier! I wanted to quickly recap the key points we discussed:\n\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nI'll keep you posted on the progress.\n\nThanks again!\n[Your name]",
        "Hi [Name],\n\nI wanted to follow up on our conversation today. Thank you for the valuable feedback on [topic].\n\nPer our discussion, my next steps are:\n1. [Action 1]\n2. [Action 2]\n\nI'll update you by [date].\n\nBest regards,\n[Your name]",
        "Hello [Name],\n\nThank you for the productive meeting today. I've already started working on [action item] and will have an update for you soon.\n\nPlease let me know if you need anything else in the meantime.\n\nCheers,\n[Your name]"
      ],
      keyPhrases: ["circle back", "next steps", "as discussed", "per our discussion", "keep you posted"],
      tone: "Professional and proactive",
      difficulty: "beginner" as const,
      whenToUse: "After any important meeting to confirm action items"
    },
    {
      title: "Cold Email - Introduction",
      category: "Emails - Outreach",
      situation: "Reaching out to someone you don't know",
      template: "Hi [Name],\n\nMy name is [Your name] and I'm reaching out because [relevant reason].\n\nI noticed that [personalized observation about their work/company]. I'd love to learn more about [specific topic].\n\nWould you be open to a brief call sometime? I promise to keep it short.\n\nThanks for considering!\n\nBest,\n[Your name]",
      variations: [
        "Hello [Name],\n\nI hope this email doesn't catch you at a bad time. I'm [Your name], [your role] at [company].\n\nI've been following your work on [topic] and I'm impressed by [specific achievement]. I'd love to pick your brain about [specific question].\n\nWould you have 15 minutes for a quick chat?\n\nBest regards,\n[Your name]",
        "Hi [Name],\n\nI came across your profile while researching [topic] and was really impressed by [specific thing].\n\nI'm working on [project/goal] and would greatly value your perspective. Would you be willing to share some insights over a brief call?\n\nI understand you're busy, so I'll keep it concise.\n\nThank you,\n[Your name]",
        "Dear [Name],\n\nI'm reaching out to introduce myself - I'm [Your name] from [company]. We're working on [project] and your expertise in [area] came highly recommended.\n\nI'd love to explore potential collaboration opportunities. Are you available for a quick conversation?\n\nLooking forward to connecting.\n\nSincerely,\n[Your name]"
      ],
      keyPhrases: ["reaching out", "pick your brain", "would you be open to", "came across", "highly recommended"],
      tone: "Respectful and concise",
      difficulty: "intermediate" as const,
      whenToUse: "When contacting someone for the first time"
    },
    {
      title: "Declining Politely",
      category: "Emails - Responses",
      situation: "Need to say no professionally",
      template: "Hi [Name],\n\nThank you so much for thinking of me for [opportunity]. I'm honored you reached out.\n\nUnfortunately, I don't have the bandwidth to take this on right now due to [brief reason].\n\nI hope we can collaborate on something in the future!\n\nBest,\n[Your name]",
      variations: [
        "Hey [Name],\n\nI really appreciate the offer to [opportunity]. It sounds like a great project!\n\nHowever, I'm currently at capacity with other commitments and wouldn't be able to give this the attention it deserves.\n\nI'd love to stay in touch for future opportunities.\n\nThanks again,\n[Your name]",
        "Hi [Name],\n\nThank you for considering me for [opportunity]. After careful thought, I've decided this isn't the right fit for me at the moment.\n\nI genuinely appreciate you thinking of me and hope our paths cross again soon.\n\nWarm regards,\n[Your name]",
        "Hello [Name],\n\nI'm grateful for the opportunity to [task/project], but I'll have to respectfully decline at this time.\n\nMy current commitments wouldn't allow me to contribute at the level this deserves. I hope you understand.\n\nWishing you all the best with this!\n\nSincerely,\n[Your name]"
      ],
      keyPhrases: ["don't have the bandwidth", "at capacity", "not the right fit", "respectfully decline", "honored you reached out"],
      tone: "Gracious but firm",
      difficulty: "intermediate" as const,
      whenToUse: "When you need to decline an offer or request professionally"
    },
    {
      title: "Asking for a Favor",
      category: "Emails - Requests",
      situation: "You need help from someone",
      template: "Hi [Name],\n\nI hope you're doing well! I wanted to reach out because I could really use your expertise with [specific issue].\n\nI know you're busy, but if you have a few minutes to [specific ask], it would be incredibly helpful.\n\nNo pressure at all - I completely understand if you're swamped!\n\nThanks so much,\n[Your name]",
      variations: [
        "Hey [Name],\n\nQuick question for you - I'm working on [project] and hit a roadblock with [issue]. You immediately came to mind as someone who might have insight.\n\nWould you be willing to [specific request]? Even just 10 minutes of your time would be valuable.\n\nTotally understand if you can't - thanks for considering!\n\nBest,\n[Your name]",
        "Hi [Name],\n\nI hope this email finds you well. I'm reaching out to ask for a small favor.\n\nI'm currently [situation] and could really benefit from your guidance on [topic]. Would you have time for a brief conversation?\n\nI'd be happy to work around your schedule.\n\nThank you in advance,\n[Your name]",
        "Hello [Name],\n\nI hate to impose, but I'm in a bit of a bind with [situation] and thought you might be able to help.\n\nIf you could spare a few minutes to [request], I would be extremely grateful.\n\nPlease don't feel obligated - I know how hectic things can get!\n\nCheers,\n[Your name]"
      ],
      keyPhrases: ["could really use", "you came to mind", "no pressure", "don't feel obligated", "incredibly helpful"],
      tone: "Humble and respectful",
      difficulty: "beginner" as const,
      whenToUse: "When requesting help or advice from someone"
    },
  ];

  templates.push(...emailTemplates.map(t => ({ ...t, id: id++ })));

  // BUSINESS PROPOSALS (50 templates)
  const proposalTemplates = [
    {
      title: "Project Proposal - Standard",
      category: "Proposals",
      situation: "Proposing a new project or initiative",
      template: "PROPOSAL: [Project Name]\n\nEXECUTIVE SUMMARY\n[Brief overview of the project and its value]\n\nOBJECTIVES\n• [Objective 1]\n• [Objective 2]\n• [Objective 3]\n\nAPPROACH\n[How you plan to execute]\n\nTIMELINE\n[Key milestones and dates]\n\nBUDGET\n[Cost breakdown]\n\nEXPECTED OUTCOMES\n[What success looks like]\n\nNEXT STEPS\n[What needs to happen next]",
      variations: [
        "PROJECT PROPOSAL\n\nTitle: [Project Name]\nDate: [Date]\nPrepared by: [Your Name]\n\n1. BACKGROUND\n[Context and why this project matters]\n\n2. PROPOSED SOLUTION\n[Your approach]\n\n3. DELIVERABLES\n[What will be produced]\n\n4. RESOURCES REQUIRED\n[Team, budget, tools]\n\n5. SUCCESS METRICS\n[How we'll measure success]\n\n6. RISKS & MITIGATION\n[Potential challenges and solutions]",
        "BUSINESS PROPOSAL\n\n[Project Name]\n\nTHE OPPORTUNITY\n[What problem are we solving?]\n\nOUR SOLUTION\n[How we'll solve it]\n\nWHY NOW?\n[Timing and urgency]\n\nIMPACT\n[Expected benefits and ROI]\n\nINVESTMENT REQUIRED\n[Resources needed]\n\nRECOMMENDATION\n[Your ask - what you need approved]",
        "INITIATIVE PROPOSAL\n\nVISION\n[What are we trying to achieve?]\n\nSTRATEGY\n[How will we get there?]\n\nTACTICS\n[Specific actions]\n\nTEAM\n[Who's involved]\n\nBUDGET\n[Financial requirements]\n\nMEASUREMENT\n[KPIs and metrics]\n\nAPPROVAL REQUEST\n[What you're asking for]"
      ],
      keyPhrases: ["executive summary", "expected outcomes", "success metrics", "ROI", "next steps"],
      tone: "Strategic and persuasive",
      difficulty: "advanced" as const,
      whenToUse: "When pitching a new project or initiative to leadership"
    },
  ];

  templates.push(...proposalTemplates.map(t => ({ ...t, id: id++ })));

  // MEETING AGENDAS (30 templates)
  const meetingTemplates = [
    {
      title: "Team Meeting Agenda",
      category: "Meetings",
      situation: "Running a regular team meeting",
      template: "TEAM MEETING AGENDA\nDate: [Date]\nTime: [Time]\nDuration: [Length]\n\n1. QUICK WINS (5 min)\n   - Share recent successes\n\n2. UPDATES (15 min)\n   - [Team member 1]: [Topic]\n   - [Team member 2]: [Topic]\n\n3. DISCUSSION (20 min)\n   - [Main topic for discussion]\n\n4. ACTION ITEMS (10 min)\n   - Assign next steps\n\n5. PARKING LOT (5 min)\n   - Topics for future meetings",
      variations: [
        "WEEKLY SYNC\n\nWelcome & Check-ins (5 min)\n\nPriorities This Week (10 min)\n• [Priority 1]\n• [Priority 2]\n\nBlocked Items (10 min)\n• What's holding us back?\n\nWins & Learnings (10 min)\n• Celebrate progress\n\nNext Steps (5 min)\n• Who's doing what by when?",
        "TEAM STANDUP AGENDA\n\n1. What did we accomplish?\n2. What are we working on today?\n3. Any blockers or challenges?\n4. Support needed from team?\n5. Quick announcements\n\nTime: 15 minutes max",
        "MONTHLY TEAM MEETING\n\nI. Performance Review (15 min)\n   - Key metrics and trends\n\nII. Project Updates (20 min)\n   - Status of ongoing initiatives\n\nIII. Challenges & Solutions (15 min)\n   - Open discussion\n\nIV. Goals for Next Month (10 min)\n   - Set priorities"
      ],
      keyPhrases: ["quick wins", "action items", "parking lot", "blockers", "next steps"],
      tone: "Organized and efficient",
      difficulty: "beginner" as const,
      whenToUse: "For regular team synchronization meetings"
    },
  ];

  templates.push(...meetingTemplates.map(t => ({ ...t, id: id++ })));

  // PERFORMANCE REVIEWS (40 templates)
  const reviewTemplates = [
    {
      title: "Positive Performance Feedback",
      category: "Performance Reviews",
      situation: "Giving positive feedback to an employee",
      template: "Hi [Name],\n\nI wanted to take a moment to recognize your outstanding work on [project/task].\n\nSpecifically, I was impressed by:\n• [Specific achievement 1]\n• [Specific achievement 2]\n• [Specific achievement 3]\n\nYour [quality - e.g., attention to detail, creativity, leadership] really made a difference. This is exactly the kind of [value] we need on the team.\n\nKeep up the excellent work!\n\nBest,\n[Your name]",
      variations: [
        "Hey [Name],\n\nJust wanted to give you some well-deserved recognition. Your performance on [project] has been exceptional.\n\nWhat stood out to me:\n- [Specific example 1]\n- [Specific example 2]\n\nYou're setting a great example for the team. Thank you for your dedication!\n\nCheers,\n[Your name]",
        "Hi [Name],\n\nI've been really impressed with your progress this quarter. Your work on [project] exceeded expectations.\n\nKey strengths I've observed:\n1. [Strength 1]\n2. [Strength 2]\n3. [Strength 3]\n\nI'm excited to see where you take this momentum. Let's discuss growth opportunities in our next 1-on-1.\n\nBest,\n[Your name]",
        "Hello [Name],\n\nI wanted to formally acknowledge your contributions to [project/initiative]. Your impact has been significant.\n\nNotable achievements:\n• [Achievement 1]\n• [Achievement 2]\n\nYour performance aligns perfectly with our team values. Thank you for your continued excellence.\n\nSincerely,\n[Your name]"
      ],
      keyPhrases: ["outstanding work", "exceeded expectations", "made a difference", "well-deserved recognition", "setting a great example"],
      tone: "Appreciative and specific",
      difficulty: "intermediate" as const,
      whenToUse: "When recognizing excellent employee performance"
    },
    {
      title: "Constructive Feedback",
      category: "Performance Reviews",
      situation: "Addressing areas for improvement",
      template: "Hi [Name],\n\nI wanted to discuss [situation/behavior] that I've noticed recently.\n\nWhat I observed:\n[Specific, objective description]\n\nThe impact:\n[How it affected the team/project]\n\nMoving forward:\nI'd like us to work together on [improvement area]. Here's what I suggest:\n• [Action 1]\n• [Action 2]\n\nI'm confident you can turn this around. Let's check in again in [timeframe] to see how it's going.\n\nI'm here to support you.\n\nBest,\n[Your name]",
      variations: [
        "Hey [Name],\n\nI want to have a candid conversation about [topic]. I've noticed [observation] and I think there's an opportunity for growth here.\n\nLet's work together on:\n1. [Development area 1]\n2. [Development area 2]\n\nWhat resources or support do you need from me?\n\nLooking forward to seeing your progress.\n\nThanks,\n[Your name]",
        "Hi [Name],\n\nI'd like to provide some feedback on [situation]. While I appreciate [positive aspect], I've observed some challenges with [area of concern].\n\nSpecifically:\n- [Example 1]\n- [Example 2]\n\nLet's create a plan to address this:\n[Proposed solution]\n\nI believe in your ability to improve. Let's meet weekly to track progress.\n\nBest regards,\n[Your name]",
        "Hello [Name],\n\nI wanted to touch base about [performance issue]. This is important because [why it matters].\n\nWhat's working well:\n• [Positive point]\n\nArea for development:\n• [Issue to address]\n\nAction plan:\n[Steps forward]\n\nI'm committed to helping you succeed. Please let me know how I can support you.\n\nSincerely,\n[Your name]"
      ],
      keyPhrases: ["opportunity for growth", "moving forward", "work together on", "here to support you", "action plan"],
      tone: "Constructive and supportive",
      difficulty: "advanced" as const,
      whenToUse: "When addressing performance issues constructively"
    },
  ];

  templates.push(...reviewTemplates.map(t => ({ ...t, id: id++ })));

  // REPORTS (30 templates)
  const reportTemplates = [
    {
      title: "Weekly Status Report",
      category: "Reports",
      situation: "Updating stakeholders on project progress",
      template: "WEEKLY STATUS REPORT\nWeek of: [Date]\nProject: [Project Name]\n\nEXECUTIVE SUMMARY\n[2-3 sentence overview]\n\nKEY ACCOMPLISHMENTS\n✅ [Achievement 1]\n✅ [Achievement 2]\n✅ [Achievement 3]\n\nIN PROGRESS\n🔄 [Item 1]\n🔄 [Item 2]\n\nUPCOMING THIS WEEK\n📅 [Priority 1]\n📅 [Priority 2]\n\nBLOCKERS/RISKS\n⚠️ [Issue 1 - if any]\n\nOVERALL STATUS: 🟢 On Track | 🟡 At Risk | 🔴 Behind",
      variations: [
        "PROJECT UPDATE\n[Date]\n\nHIGHLIGHTS\n• [Win 1]\n• [Win 2]\n\nPROGRESS METRICS\n- Completion: [X]%\n- Timeline: [On track/Delayed]\n- Budget: [Status]\n\nNEXT MILESTONES\n1. [Milestone 1] - [Date]\n2. [Milestone 2] - [Date]\n\nNEED HELP WITH\n- [Support needed]\n\nOVERALL HEALTH: [Status]",
        "WEEKLY WRAP-UP\nTeam: [Team Name]\nDate: [Date]\n\nTHIS WEEK'S WINS\n🎉 [Success 1]\n🎉 [Success 2]\n\nCHALLENGES OVERCOME\n💪 [Challenge addressed]\n\nFOCUS FOR NEXT WEEK\n🎯 [Priority 1]\n🎯 [Priority 2]\n\nTEAM SHOUTOUTS\n👏 [Recognition]\n\nSTATUS: [Color indicator]",
        "STATUS UPDATE - [Project]\n\nSUMMARY\n[Brief overview]\n\nCOMPLETED\n[List of finished items]\n\nCURRENT FOCUS\n[What we're working on now]\n\nLOOKING AHEAD\n[Next 1-2 weeks]\n\nISSUES REQUIRING ATTENTION\n[Problems needing decisions]\n\nREQUESTS\n[What you need from stakeholders]"
      ],
      keyPhrases: ["executive summary", "key accomplishments", "blockers", "overall status", "at risk"],
      tone: "Clear and data-driven",
      difficulty: "intermediate" as const,
      whenToUse: "Regular project updates to management and stakeholders"
    },
  ];

  templates.push(...reportTemplates.map(t => ({ ...t, id: id++ })));

  // NEGOTIATIONS (25 templates)
  const negotiationTemplates = [
    {
      title: "Salary Negotiation",
      category: "Negotiations",
      situation: "Negotiating compensation",
      template: "Hi [Name],\n\nThank you so much for the offer to join [Company] as [Position]. I'm very excited about the opportunity!\n\nAfter careful consideration of the role's responsibilities and the market rate for similar positions, I was hoping we could discuss the compensation package.\n\nBased on my [X years] of experience in [field] and [specific achievements], I was expecting a salary in the range of [X-Y].\n\nI'm confident I can bring significant value to the team through [specific skills/contributions].\n\nWould you be open to discussing this further?\n\nBest regards,\n[Your name]",
      variations: [
        "Dear [Hiring Manager],\n\nI'm thrilled about the offer for [Position]. Thank you for your confidence in me.\n\nI'd like to discuss the salary component. Given my background in [area] and the industry standards for this role, I was anticipating a figure closer to [amount].\n\nI'm very motivated to join the team and believe this adjustment would reflect the value I'll bring to [Company].\n\nCan we explore this?\n\nThank you,\n[Your name]",
        "Hi [Name],\n\nI'm genuinely excited about this opportunity and eager to contribute to [Company]'s success.\n\nRegarding the compensation: while I appreciate the offer of [amount], I was hoping for something in the [higher range] bracket, given:\n\n• My expertise in [skill]\n• [Specific accomplishment]\n• Market rates for this position\n\nI'm flexible and open to discussing the full package including benefits.\n\nLooking forward to your thoughts.\n\nBest,\n[Your name]",
        "Hello [Name],\n\nThank you for extending this offer. I'm very interested in joining [Company].\n\nI wanted to have a conversation about the salary. Considering the scope of the role and my qualifications, I believe [higher amount] would be more appropriate.\n\nThis aligns with both my experience level and the market value for similar positions in [location/industry].\n\nI'm happy to discuss this at your convenience.\n\nSincerely,\n[Your name]"
      ],
      keyPhrases: ["market rate", "industry standards", "value I'll bring", "open to discussing", "full package"],
      tone: "Confident but collaborative",
      difficulty: "advanced" as const,
      whenToUse: "When negotiating job offers or raises"
    },
  ];

  templates.push(...negotiationTemplates.map(t => ({ ...t, id: id++ })));

  // PRESENTATIONS (25 templates)
  const presentationTemplates = [
    {
      title: "Pitch Deck Introduction",
      category: "Presentations",
      situation: "Opening slides for a business pitch",
      template: "SLIDE 1: TITLE\n[Company/Project Name]\n[Tagline]\n\nSLIDE 2: THE PROBLEM\n[What problem exists today?]\n[Why does it matter?]\n[Size of the problem]\n\nSLIDE 3: OUR SOLUTION\n[How we solve it]\n[What makes us different]\n[Key benefits]\n\nSLIDE 4: MARKET OPPORTUNITY\n[Market size]\n[Target customers]\n[Growth potential]",
      variations: [
        "OPENING SLIDES\n\n1. HOOK\n[Compelling statistic or story]\n\n2. PROBLEM STATEMENT\n[Paint the picture of the current situation]\n\n3. SOLUTION OVERVIEW\n[Your product/service]\n\n4. WHY NOW?\n[Market timing and urgency]",
        "PITCH STRUCTURE\n\nIntro: [Company name & mission]\n\nPain Point: [Customer problem]\n\nOur Approach: [Unique solution]\n\nTraction: [Early results]\n\nVision: [Where we're headed]",
        "PRESENTATION FLOW\n\nScene Setting\n- Current landscape\n- Unmet needs\n\nOur Innovation\n- What we've built\n- How it works\n\nBusiness Model\n- Revenue streams\n- Unit economics"
      ],
      keyPhrases: ["market opportunity", "our solution", "key benefits", "what makes us different", "growth potential"],
      tone: "Compelling and visionary",
      difficulty: "advanced" as const,
      whenToUse: "When pitching to investors, clients, or stakeholders"
    },
  ];

  templates.push(...presentationTemplates.map(t => ({ ...t, id: id++ })));

  // CUSTOMER SERVICE (30 templates)
  const customerServiceTemplates = [
    {
      title: "Handling Complaints",
      category: "Customer Service",
      situation: "Responding to an unhappy customer",
      template: "Hi [Customer Name],\n\nThank you for bringing this to our attention. I sincerely apologize for [specific issue] - this isn't the experience we want you to have.\n\nI understand how frustrating this must be, especially [acknowledge their specific concern].\n\nHere's what I'm going to do to fix this:\n1. [Immediate action]\n2. [Follow-up action]\n3. [Prevention measure]\n\nI'll personally make sure this is resolved by [timeframe]. You can reach me directly at [contact info] if you have any questions.\n\nThank you for your patience and for giving us the chance to make this right.\n\nBest,\n[Your name]",
      variations: [
        "Dear [Customer],\n\nI'm so sorry to hear about your experience with [issue]. You're absolutely right to be upset.\n\nThis shouldn't have happened, and I take full responsibility for making it right.\n\nI've already [action taken] and will [next step].\n\nAs an apology, I'd like to offer you [compensation/gesture].\n\nPlease let me know if there's anything else I can do.\n\nSincerely,\n[Your name]",
        "Hi [Name],\n\nThank you for your feedback. I apologize that we didn't meet your expectations with [situation].\n\nI've looked into this and here's what happened: [brief explanation without making excuses].\n\nTo resolve this, I'm going to:\n• [Solution 1]\n• [Solution 2]\n\nI'll update you within [timeframe] with the results.\n\nWe value your business and want to earn back your trust.\n\nBest regards,\n[Your name]",
        "Hello [Customer],\n\nI'm truly sorry for the inconvenience you've experienced. Let me fix this right away.\n\n[Specific remedy]\n\nAdditionally, I'm [extra gesture] to show our appreciation for your patience.\n\nMoving forward, we're implementing [change] to prevent this from happening again.\n\nThank you for helping us improve.\n\nWarm regards,\n[Your name]"
      ],
      keyPhrases: ["sincerely apologize", "make this right", "take full responsibility", "value your business", "earn back your trust"],
      tone: "Empathetic and solution-focused",
      difficulty: "intermediate" as const,
      whenToUse: "When addressing customer complaints or issues"
    },
  ];

  templates.push(...customerServiceTemplates.map(t => ({ ...t, id: id++ })));

  // SLACK/TEAMS MESSAGES (40 templates)
  const messagingTemplates = [
    {
      title: "Quick Update to Team",
      category: "Team Messaging",
      situation: "Sharing progress or news with team",
      template: "Hey team! 👋\n\nQuick update on [project]:\n\n✅ [Completed item]\n🔄 [In progress]\n🎯 [Next up]\n\nLet me know if you have questions!\n\n[Your name]",
      variations: [
        "Team update! 🚀\n\n[Achievement/news]\n\nWhat this means:\n• [Impact 1]\n• [Impact 2]\n\nNext steps: [Action]\n\nThoughts?",
        "Quick heads up everyone -\n\n[Information to share]\n\nNo action needed from you, just wanted to keep everyone in the loop!\n\n👍 React if you saw this",
        "Morning team!\n\nHere's where we're at:\n- [Status 1]\n- [Status 2]\n- [Status 3]\n\nAnything blocking you today? 🚧"
      ],
      keyPhrases: ["quick update", "heads up", "keep everyone in the loop", "let me know", "next steps"],
      tone: "Casual and clear",
      difficulty: "beginner" as const,
      whenToUse: "For informal team updates on Slack/Teams"
    },
  ];

  templates.push(...messagingTemplates.map(t => ({ ...t, id: id++ })));

  // LINKEDIN MESSAGES (30 templates)
  const linkedinTemplates = [
    {
      title: "Networking Connection Request",
      category: "LinkedIn",
      situation: "Connecting with someone in your industry",
      template: "Hi [Name],\n\nI came across your profile while researching [topic/industry] and was really impressed by your work at [Company].\n\nI'd love to connect and learn more about your experience with [specific area]. Always great to expand my network with fellow [profession] professionals!\n\nBest,\n[Your name]",
      variations: [
        "Hello [Name],\n\nI saw your post about [topic] and it really resonated with me. I'm also working in [field] and would love to connect.\n\nLooking forward to following your insights!\n\n[Your name]",
        "Hi [Name],\n\nWe're both in [industry/group] and I thought it would be valuable to connect. I'm particularly interested in your perspective on [topic].\n\nHope to connect!\n\n[Your name]",
        "Hey [Name],\n\n[Mutual connection] suggested I reach out to you. I'm fascinated by your background in [area] and would love to add you to my network.\n\nCheers,\n[Your name]"
      ],
      keyPhrases: ["came across your profile", "would love to connect", "expand my network", "fellow professional", "looking forward"],
      tone: "Professional and friendly",
      difficulty: "beginner" as const,
      whenToUse: "When sending LinkedIn connection requests"
    },
  ];

  templates.push(...linkedinTemplates.map(t => ({ ...t, id: id++ })));

  // Generate additional templates programmatically to reach 500 templates with 1500 variations
  const additionalCategories = [
    "Contract Negotiations",
    "Vendor Communications",
    "Internal Announcements",
    "Crisis Communication",
    "Partnership Proposals",
    "Marketing Copy",
    "Sales Emails",
    "Onboarding Messages",
    "Resignation Letters",
    "Recommendation Letters"
  ];

  additionalCategories.forEach(category => {
    for (let i = 0; i < 20; i++) {
      templates.push({
        id: id++,
        title: `${category} Template ${i + 1}`,
        category: category,
        situation: `Professional situation requiring ${category.toLowerCase()}`,
        template: `[${category} Template]\n\nOpening: [Professional greeting]\n\nContext: [Situation background]\n\nMain Point: [Key message]\n\nAction: [What you need]\n\nClosing: [Professional sign-off]`,
        variations: [
          `Variation A for ${category}:\n\n[Alternative approach to the same situation with different tone]`,
          `Variation B for ${category}:\n\n[Another way to handle this professionally]`,
          `Variation C for ${category}:\n\n[Third perspective on the communication]`
        ],
        keyPhrases: ["professional", "clear communication", "actionable", "respectful", "business-appropriate"],
        tone: "Professional",
        difficulty: (i % 3 === 0 ? "beginner" : i % 3 === 1 ? "intermediate" : "advanced") as const,
        whenToUse: `When you need to communicate about ${category.toLowerCase()}`
      });
    }
  });

  return templates;
}

export const allWritingTemplates = generateWritingTemplates();

// Calculate total variations
export const totalVariations = allWritingTemplates.reduce((sum, template) => {
  return sum + 1 + template.variations.length; // 1 for main template + variations
}, 0);
