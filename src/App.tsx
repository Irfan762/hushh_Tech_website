import React, { Suspense, useEffect, ReactNode, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/home/ui';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import OnboardingShellAutoPadding from './components/OnboardingShellAutoPadding';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalNDAGate from './components/GlobalNDAGate';
import { AuthSessionProvider, useAuthSession } from './auth/AuthSessionProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRequiredRoute from './components/AuthRequiredRoute';

// Lazy loaded page components
const Leadership = lazy(() => import('./components/Leadership'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const LoginPage = lazy(() => import('./pages/login/ui'));
const Contact = lazy(() => import('./pages/Contact'));
const Consumers = lazy(() => import('./pages/services/consumers'));
const Business = lazy(() => import('./pages/services/business'));
const SignupPage = lazy(() => import('./pages/signup/ui'));
const Faq = lazy(() => import('./pages/faq'));
const Career = lazy(() => import('./pages/career'));
const CommunityPage = lazy(() => import('./pages/community/ui'));
const CommunityPostPage = lazy(() => import('./pages/community/post-ui'));
const ReportDetailPage = lazy(() => import('./pages/reports/reportDetail'));
const BenefitsPage = lazy(() => import('./pages/benefits'));
const PrivacyPolicy = lazy(() => import('./pages/privacy-policy'));
const CareersPrivacyPolicy = lazy(() => import('./pages/career-privacy-policy'));
const CaliforniaPrivacyPolicy = lazy(() => import('./pages/california-privacy-policy'));
const EUUKPrivacyPolicy = lazy(() => import('./pages/eu-uk-privacy-policy'));
const DeleteAccountPage = lazy(() => import('./pages/delete-account'));
const Profile = lazy(() => import('./pages/profile'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const KYCVerificationPage = lazy(() => import('./pages/kyc-verification/page'));
const NDARequestModalComponent = lazy(() => import('./components/NDARequestModal'));
const UserProfilePage = lazy(() => import('./pages/user-profile/page'));
const InvestorProfilePage = lazy(() => import('./pages/investor-profile'));
const KYCFormPage = lazy(() => import('./pages/kyc-form/page'));
const DiscoverFundA = lazy(() => import('./pages/discover-fund-a'));
const SellTheWallPage = lazy(() => import('./pages/sell-the-wall'));
const AIPoweredBerkshirePage = lazy(() => import('./pages/ai-powered-berkshire'));
const UserRegistration = lazy(() => import('./pages/UserRegistration'));
const YourProfilePage = lazy(() => import('./pages/your-profile'));
const HushhUserProfilePage = lazy(() => import('./pages/hushh-user-profile'));
const ViewPreferencesPage = lazy(() => import('./pages/hushh-user-profile/view'));
const PrivacyControlsPage = lazy(() => import('./pages/hushh-user-profile/privacy'));
const PublicHushhProfilePage = lazy(() => import('./pages/hushhid'));
const PublicInvestorProfilePage = lazy(() => import('./pages/investor/PublicInvestorProfile'));
const HushhIDHeroDemo = lazy(() => import('./pages/hushhid-hero-demo'));
const FinancialLinkPage = lazy(() => import('./pages/onboarding/financial-link/ui'));
const OnboardingStep1 = lazy(() => import('./pages/onboarding/step-1/ui'));
const OnboardingStep2 = lazy(() => import('./pages/onboarding/step-2/ui'));
const OnboardingStep3 = lazy(() => import('./pages/onboarding/step-3/ui'));
const OnboardingStep4 = lazy(() => import('./pages/onboarding/step-4/ui'));
const OnboardingStep5 = lazy(() => import('./pages/onboarding/step-5/ui'));
const OnboardingStep6 = lazy(() => import('./pages/onboarding/step-6/ui'));
const OnboardingStep7 = lazy(() => import('./pages/onboarding/step-7/ui'));
const OnboardingReviewStep = lazy(() => import('./pages/onboarding/step-8/ui'));
const OnboardingBankDetailsStep = lazy(() => import('./pages/onboarding/step-9/ui'));
const VerifyIdentityPage = lazy(() => import('./pages/onboarding/verify-identity/ui'));
const VerifyCompletePage = lazy(() => import('./pages/onboarding/verify-complete/ui'));
const MeetCeoPage = lazy(() => import('./pages/onboarding/meet-ceo/ui'));
const InvestorGuidePage = lazy(() => import('./pages/onboarding/InvestorGuide'));
const KYCDemoPage = lazy(() => import('./pages/kyc-demo'));
const KycFlowPage = lazy(() => import('./pages/kyc-flow'));
const A2APlaygroundPage = lazy(() => import('./pages/a2a-playground'));
const ReceiptGeneratorPage = lazy(() => import('./pages/receipt-generator'));
const DeveloperDocsPage = lazy(() => import('./pages/developer-docs'));
const HushhAIPage = lazy(() => import('./hushh-ai/pages'));
const HushhAILoginPage = lazy(() => import('./hushh-ai/presentation/pages').then(m => ({ default: m.LoginPage })));
const HushhAISignupPage = lazy(() => import('./hushh-ai/presentation/pages').then(m => ({ default: m.SignupPage })));
const KaiApp = lazy(() => import('./kai/pages'));
const HushhStudioApp = lazy(() => import('./hushh-studio/pages'));
const SignNDAPage = lazy(() => import('./pages/sign-nda'));
const DocumentViewerPage = lazy(() => import('./pages/document-viewer'));
const NDAAdminPage = lazy(() => import('./pages/nda-admin'));



// Google Analytics configuration
const GA_TRACKING_ID = 'G-R58S9WWPM0';
const KaiIndiaApp = React.lazy(() => import('./kai-india/pages'));

// Content wrapper component that applies conditional margin
const ContentWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/signUp' || location.pathname === '/solutions';
  const isAuthCallback = location.pathname.startsWith('/auth/callback');
  const isUserRegistration = location.pathname === '/user-registration';
  const isOnboarding = location.pathname.startsWith('/onboarding');
  const isKycFlow = location.pathname.startsWith('/kyc-flow');
  const isKycDemo = location.pathname.startsWith('/kyc-demo');
  const isA2APlayground = location.pathname.startsWith('/a2a-playground');
  const isInvestorGuide = location.pathname === '/investor-guide';
  const isHushhAI = location.pathname.startsWith('/hushh-ai');
  const isKai = location.pathname.startsWith('/kai');
  const isStudio = location.pathname.startsWith('/studio');
  const isHushhUserProfile = location.pathname.startsWith('/hushh-user-profile');
  const isSignNda = location.pathname.startsWith('/sign-nda');
  const isDocumentViewer = location.pathname.startsWith('/document-viewer');
  const isInvestorProfile = location.pathname.startsWith('/investor-profile');
  const isPublicInvestorProfile = location.pathname.startsWith('/investor/');
  const isDiscoverFundA = location.pathname === '/discover-fund-a';
  const isCommunity = location.pathname.startsWith('/community');
  const isDeleteAccount = location.pathname === '/delete-account';
  const isLogin = location.pathname.toLowerCase() === '/login';
  const isSignup = location.pathname.toLowerCase() === '/signup';
  const isProfile = location.pathname === '/profile';

  return (
    <div className={`${isHomePage || isAuthCallback || isUserRegistration || isOnboarding || isKycFlow || isKycDemo || isA2APlayground || isInvestorGuide || isHushhAI || isKai || isStudio || isHushhUserProfile || isSignNda || isDocumentViewer || isInvestorProfile || isPublicInvestorProfile || isDiscoverFundA || isCommunity || isDeleteAccount || isLogin || isSignup || isProfile ? '' : 'mt-20'}`}>
      {children}
    </div>
  );
};

// Layout visibility hook - determines which components to show based on route
const useLayoutVisibility = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isHushhAI = location.pathname.startsWith('/hushh-ai');
  const isKai = location.pathname.startsWith('/kai');
  const isStudio = location.pathname.startsWith('/studio');
  const isOnboarding = location.pathname.startsWith('/onboarding');
  const isProfile = location.pathname === '/profile';
  const isFundA = location.pathname === '/discover-fund-a';
  const isCommunity = location.pathname.startsWith('/community');
  const isDeleteAccount = location.pathname === '/delete-account';
  const isLogin = location.pathname.toLowerCase() === '/login';
  const isSignup = location.pathname.toLowerCase() === '/signup';
  const isSignNda = location.pathname.startsWith('/sign-nda');
  const isDocumentViewer = location.pathname.startsWith('/document-viewer');
  const isHushhUserProfile = location.pathname.startsWith('/hushh-user-profile');

  // All pages using HushhTechHeader — hide old global Navbar/Footer
  const isKycFlow = location.pathname.startsWith('/kyc-flow');
  const isKycDemo = location.pathname.startsWith('/kyc-demo');
  const isA2APlayground = location.pathname.startsWith('/a2a-playground');
  const isPublicInvestorProfile = location.pathname.startsWith('/investor/');
  const hideOld = isHushhAI || isKai || isStudio || isHomePage || isOnboarding || isProfile || isFundA || isCommunity || isDeleteAccount || isLogin || isSignup || isSignNda || isDocumentViewer || isHushhUserProfile || isKycFlow || isKycDemo || isA2APlayground || isPublicInvestorProfile;
  return {
    showNavbar: !hideOld,
    showFooter: !hideOld,
    showMobileNav: !hideOld,
  };
};

// Google Analytics setup function
const initializeGoogleAnalytics = () => {
  // Check if gtag is already loaded
  if (typeof window !== 'undefined' && !window.gtag) {
    // Create script element for gtag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_TRACKING_ID);
    };
  }
};

function App() {
  // Initialize Google Analytics
  useEffect(() => {
    initializeGoogleAnalytics();
  }, []);

  // Inner layout component that uses hooks for conditional rendering
  const AppLayout = () => {
    const { showNavbar, showFooter, showMobileNav } = useLayoutVisibility();
    const { session } = useAuthSession();
    
    return (
      <div className="min-h-screen flex flex-col">
        {showNavbar && <Navbar />}
        <ContentWrapper>
          <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about/leadership" element={<Leadership />} />
              <Route path="/about/philosophy" element={<Philosophy />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path='/services/consumers' element={<Consumers />} />
              <Route path='/services/business' element={<Business />} />
              <Route path='/Signup' element={<SignupPage />} />
              <Route path='/faq' element={<Faq />} />
              <Route path='/profile' element={
                <AuthRequiredRoute>
                  <Profile />
                </AuthRequiredRoute>
              } />
              <Route path="/career" element={<Career />} />
              <Route path="/career/*" element={<Career />} />
              <Route path='/privacy-policy' element={<PrivacyPolicy />} />
              <Route path='/carrer-privacy-policy' element={<CareersPrivacyPolicy />} />
              <Route path="/community" element={
                <CommunityPage />
              } />
              <Route path='/california-privacy-policy' element={<CaliforniaPrivacyPolicy />} />
              <Route path='/eu-uk-jobs-privacy-policy' element={<EUUKPrivacyPolicy />} />
              <Route path='/delete-account' element={
                <AuthRequiredRoute>
                  <DeleteAccountPage />
                </AuthRequiredRoute>
              } />
              <Route path="/community/*" element={
                <CommunityPostPage />
              } />
              <Route path="/reports/:id" element={

                <ReportDetailPage />

              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Investor Onboarding Guide - Public landing page */}
              <Route path="/investor-guide" element={<InvestorGuidePage />} />
              {/* Financial Link — mandatory pre-step before onboarding */}
              <Route path="/onboarding/financial-link" element={
                <ProtectedRoute>
                  <FinancialLinkPage />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-1" element={
                <ProtectedRoute>
                  <OnboardingStep1 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-2" element={
                <ProtectedRoute>
                  <OnboardingStep2 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-3" element={
                <ProtectedRoute>
                  <OnboardingStep3 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-4" element={
                <ProtectedRoute>
                  <OnboardingStep4 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-5" element={
                <ProtectedRoute>
                  <OnboardingStep5 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-6" element={
                <ProtectedRoute>
                  <OnboardingStep6 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-7" element={
                <ProtectedRoute>
                  <OnboardingStep7 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-8" element={
                <ProtectedRoute>
                  <OnboardingReviewStep />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-9" element={
                <ProtectedRoute>
                  <OnboardingBankDetailsStep />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/verify" element={
                <ProtectedRoute>
                  <VerifyIdentityPage />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/verify-complete" element={
                <ProtectedRoute>
                  <VerifyCompletePage />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/meet-ceo" element={
                <ProtectedRoute>
                  <MeetCeoPage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile" element={
                <ProtectedRoute>
                  <HushhUserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile/view" element={
                <ProtectedRoute>
                  <ViewPreferencesPage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile/privacy" element={
                <ProtectedRoute>
                  <PrivacyControlsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:id" element={
                <AuthRequiredRoute>
                  <ViewPreferencesPage />
                </AuthRequiredRoute>
              } />
              <Route path="/hushhid/:id" element={<PublicHushhProfilePage />} />
              <Route path="/hushhid-hero-demo" element={<HushhIDHeroDemo />} />
              {/* <Route path="/solutions" element={<SolutionsPage />} /> */}
              <Route path='/kyc-verification' element={

                <KYCVerificationPage />

              } />
              <Route path='/kyc-form' element={

                <KYCFormPage />

              } />
              <Route path='/discover-fund-a' element={

                <DiscoverFundA />

              } />
              <Route path='/sell-the-wall' element={

                <SellTheWallPage />

              } />
              <Route path='/ai-powered-berkshire' element={

                <AIPoweredBerkshirePage />

              } />
              <Route path='/user-registration' element={
                <ProtectedRoute>
                  <UserRegistration />
                </ProtectedRoute>
              } />
              <Route path='/nda-form' element={
                <AuthRequiredRoute>
                  <NDARequestModalComponent
                    session={session}
                    onSubmit={(result: string) => {
                      console.log("NDA submission result:", result);
                      // Handle post-submission actions here
                      if (result === "Approved" || result === "Pending" || result === "Requested permission") {
                        // Redirect to appropriate page on success
                        window.location.href = "/";
                      }
                    }}
                  />
                </AuthRequiredRoute>

              } />
              <Route path='/investor-profile' element={
                <ProtectedRoute>
                  <InvestorProfilePage />
                </ProtectedRoute>
              } />
              <Route path='/investor/:slug' element={<PublicInvestorProfilePage />} />
              <Route path='/user-profile' element={
                <AuthRequiredRoute>
                  <UserProfilePage />
                </AuthRequiredRoute>
              } />
              <Route path='/your-profile' element={
                <AuthRequiredRoute>
                  <YourProfilePage />
                </AuthRequiredRoute>
              } />
              <Route path='/kyc-demo' element={<KYCDemoPage />} />
              <Route path='/kyc-flow' element={<KycFlowPage />} />
              <Route path='/a2a-playground' element={<A2APlaygroundPage />} />
              <Route path='/receipt-generator' element={<ReceiptGeneratorPage />} />
              <Route path='/developer-docs' element={<DeveloperDocsPage />} />
              <Route path='/hushh-ai' element={<HushhAIPage />} />
              <Route path='/hushh-ai/login' element={<HushhAILoginPage />} />
              <Route path='/hushh-ai/signup' element={<HushhAISignupPage />} />
              {/* Kai - Financial Intelligence Agent */}
              {/* Real-time AI voice/video financial advisor powered by Gemini 2.0 Flash */}
              <Route path='/kai' element={<KaiApp />} />
              {/* Kai India - Indian Market Intelligence Dashboard */}
              {/* Real-time NSE/BSE market data powered by Gemini 2.5 Flash with Google Search */}
              <Route
                path='/kai-india'
                element={
                  <KaiIndiaApp />
                }
              />
              {/* Hushh Studio - FREE AI Video Generation */}
              {/* Powered by Google Veo 3.1 - No login required, free for Indian audience */}
              <Route path='/studio' element={<HushhStudioApp />} />
              {/* Global NDA Signing Page */}
              <Route path='/sign-nda' element={<SignNDAPage />} />
              <Route path='/document-viewer' element={<DocumentViewerPage />} />
              {/* NDA Admin Page - Password protected view of all NDA agreements */}
              <Route path='/nda-admin' element={<NDAAdminPage />} />
            </Routes>
          </Suspense>
        </ContentWrapper>

        {showFooter && <Footer />}
        {showMobileNav && <MobileBottomNav />}
      </div>
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <AuthSessionProvider>
        <Router>
          <ScrollToTop />
          <OnboardingShellAutoPadding />
          <GlobalNDAGate>
            <AppLayout />
          </GlobalNDAGate>
        </Router>
      </AuthSessionProvider>
    </ChakraProvider>
  );
}

export default App;
