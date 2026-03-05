import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import FluencyHub from "./components/FluencyHub";
import InputHub from "./components/InputHub";
import StructureHub from "./components/StructureHub";
import ProfessionalHub from "./components/ProfessionalHub";
import Vocabulary from "./components/Vocabulary";
import Speaking from "./components/Speaking";
import Slang from "./components/Slang";
import Writing from "./components/Writing";
import DailyChallenge from "./components/DailyChallenge";
import Coach from "./components/Coach";
import Grammar from "./components/Grammar";
import VerbEngine from "./components/VerbEngine";
import ConversationSimulator from "./components/ConversationSimulator";
import ListeningComprehension from "./components/ListeningComprehension";
import ShadowingPractice from "./components/ShadowingPractice";
import ThinkInEnglish from "./components/ThinkInEnglish";
import StorytellingPractice from "./components/StorytellingPractice";
import CulturalContext from "./components/CulturalContext";
import RealConversation from "./components/RealConversation";
import NotificationsSettings from "./components/NotificationsSettings";
import NativeExposureLab from "./components/NativeExposureLab";
import Settings from "./components/Settings";
import BehaviorSystem from "./components/BehaviorSystem";
import PronunciationLab from "./components/PronunciationLab";
import IconGenerator from "./components/IconGenerator";

// Admin imports
import { AdminLogin } from "./admin/Login";
import { ProtectedAdminLayout } from "./admin/ProtectedAdminLayout";
import { Dashboard as AdminDashboard } from "./admin/Dashboard";
import { Users } from "./admin/Users";
import { Analytics } from "./admin/Analytics";
import { Security } from "./admin/Security";
import { Messages } from "./admin/Messages";
import { Content } from "./admin/Content";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "fluency", Component: FluencyHub },
      { path: "input", Component: InputHub },
      { path: "structure", Component: StructureHub },
      { path: "professional", Component: ProfessionalHub },
      { path: "vocabulary", Component: Vocabulary },
      { path: "conversation", Component: ConversationSimulator },
      { path: "real-conversation", Component: RealConversation },
      { path: "youtube", Component: NativeExposureLab },
      { path: "notifications", Component: NotificationsSettings },
      { path: "behavior", Component: BehaviorSystem },
      { path: "settings", Component: Settings },
      { path: "listening", Component: ListeningComprehension },
      { path: "shadowing", Component: ShadowingPractice },
      { path: "pronunciation", Component: PronunciationLab },
      { path: "thinking", Component: ThinkInEnglish },
      { path: "storytelling", Component: StorytellingPractice },
      { path: "cultural", Component: CulturalContext },
      { path: "speaking", Component: Speaking },
      { path: "slang", Component: Slang },
      { path: "writing", Component: Writing },
      { path: "grammar", Component: Grammar },
      { path: "verbs", Component: VerbEngine },
      { path: "challenge", Component: DailyChallenge },
      { path: "coach", Component: Coach },
    ],
  },
  {
    path: "/icon-generator",
    Component: IconGenerator,
  },
  // Admin routes
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: ProtectedAdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "dashboard", Component: AdminDashboard },
      { path: "users", Component: Users },
      { path: "analytics", Component: Analytics },
      { path: "security", Component: Security },
      { path: "messages", Component: Messages },
      { path: "content", Component: Content },
    ],
  },
]);