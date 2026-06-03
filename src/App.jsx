import './App.css';
import Home from "./pages/home";
import {Routes, Route} from "react-router-dom";
import Courses from "./pages/Courses";
import CategoryCourses from "./pages/Courses/CategoryCourses";
import PublicCourseDetail from "./pages/Courses/PublicCourseDetail";
import CheckoutPage from './pages/Courses/CheckoutPage';
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import SignupPage from "./pages/Auth/SignupPage";
import StudentDashboard from './pages/Student/StudentDashboard';
import LiveClasses from "./pages/Student/LiveClasses";
import MyCourses from './pages/Student/MyCourses';
import MyTestSeries from './pages/Student/MyTestSeries';
import StudyMaterials from './pages/Student/StudyMaterials';
import Practice from './pages/Student/Practice';
import StudentAssignmentViewPage from './pages/Student/StudentAssignmentViewPage';
import StudentQuizStartPage from './pages/Student/StudentQuizStartPage';
import StudentQuizResultPage from './pages/Student/StudentQuizResultPage';
import StudentQuizAttemptsPage from './pages/Student/StudentQuizAttempsPage';
import AllTestSeries from './pages/Student/AllTestSeries';
import AllCourses from './pages/Student/AllCourses';
import StorePage from './pages/Store/StorePage';
import ChangePassword from './pages/Student/ChangePassword';
import StudentCourseModulesPage from "./pages/Student/StudentCourseModulesPage";
import StudentModuleLessonsPage from "./pages/Student/StudentModuleLessonsPage";
import Doubts from './pages/Student/Doubts';
import TeacherCoursesPage from './pages/Teacher/TeacherCoursesPage';
import AddModulesPage from './pages/Teacher/AddModulesPage';
import PublishCoursePage from './pages/Teacher/PublishCoursePage';
import CourseManagement from './pages/Teacher/CourseManagement';
import CreateAssignmentPage from './pages/Teacher/CreateAssignmentPage';
import TeacherStudyMaterials from './pages/Teacher/TeacherStudyMaterials';
import EditProfile from './pages/Student/EditProfile';
import CreateQuizPage from './pages/Teacher/CreateQuizPage';
import TeacherQuizzesPage from './pages/Teacher/TeacherQuizzesPage';
import TeacherQuizDetailsPage from './pages/Teacher/TeacherQuizDetailsPage';
import ViewSubmissionsPage from './pages/Teacher/ViewSubmissionsPage';
import ReviewSubmissionsPageWrapper from './pages/Teacher/ReviewSubmissionsPageWrapper';
import StudentsPerformancePage from './pages/Teacher/StudentsPerformancePage';
import QueriesDoubtsPage from './pages/Teacher/QueriesDoubtsPage';
import ChangePasswordTeacher from './pages/Teacher/ChangePasswordTeacher'
import EditProfilePage from './pages/Teacher/EditProfilePage';
import TeacherModuleContentPage from './pages/Teacher/TeacherModuleContentPage';
import TeacherPaymentsPage from './pages/Teacher/TeacherPaymentsPage';
import TeacherReportsCertificationsPage from './pages/Teacher/TeacherReportsCertificationsPage';
import ParentDashboard from './pages/Parent/ParentDashboard';
import ParentStudentsPage from './pages/Parent/ParentStudentPage';
import StudentDetailsPage from './pages/Parent/StudentDetailsPage';
import ParentReportsCertificationsPage from './pages/Parent/ParentReportsCertificationsPage';
import ParentAnnouncementsPage from './pages/Parent/ParentAnnouncementsPage';
import ParentPaymentsPage from './pages/Parent/ParentPaymentsPage';
import ParentSettingsPage from './pages/Parent/ParentSettingsPage';
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ParentChangePasswordPage from './pages/Parent/ParentChangePasswordPage';

import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminAllStudentsPage from './pages/Admin/AdminAllStudentsPage';
import AdminAllTeachersPage from './pages/Admin/AdminAllTeachersPage';
import AdminConfirmAdminPage from './pages/Admin/AdminConfirmAdminPage';
import AdminConfirmTeacherPage from "./pages/Admin/AdminConfirmTeacherPage";
import FeesCollectionPage from './pages/Admin/FeesCollectionPage';
import AddFeesPage from './pages/Admin/AddFeesPage';
import FeesReceiptPage from './pages/Admin/FeesReceiptPage';
import AdminAnnouncementsPage from './pages/Admin/AdminAnnouncementsPage';
import AddAnnouncementPage from './pages/Admin/AddAnnouncementPage';
import AdminCoursesPage from './pages/Admin/AdminCoursesPage';
import AdminCourseDetailPage from './pages/Admin/AdminCourseDetailPage';
import EditCoursePage from './pages/Admin/EditCoursePage';
import AddCoursePage from './pages/Admin/AddCoursePage';

import EcomOrdersPage from './pages/Admin/Ecom/EcomOrdersPage';
import OrderDetailsPage from './pages/Admin/Ecom/OrderDetailsPage';
import CustomersPage from './pages/Admin/Ecom/CustomersPage';
import CustomerDetailsPage from './pages/Admin/Ecom/CustomerDetailsPage';
import CategoriesPage from './pages/Admin/Ecom/CategoriesPage';
import TransactionsPage from './pages/Admin/Ecom/TransactionsPage';
import AdminChangePassword from './pages/Admin/AdminChangePassword';
import SettingsPage from './pages/Admin/SettingsPage';
import AdminAddProduct from './pages/Admin/Ecom/AdminAddProduct';
import CoursePurchaseList from './pages/Admin/CoursePurchaseList';
import EcomProductList from './pages/Admin/Ecom/EcomPurchaseList';
import AdminScholarshipPage from "./pages/Admin/Scholarship/AdminScholarshipPage";
import AdminAchieversPage from "./pages/Admin/Achievers/AdminAchieversPage";
import AdminDonationsPage from "./pages/Admin/Donations/AdminDonationsPage";
import AdminDoubtsPage from "./pages/Admin/Doubts/AdminDoubtsPage";
import AdminResearchPage from "./pages/Teacher/Research/TeacherResearchPage";
import AdminContactsPage from "./pages/Admin/Contacts/AdminContactsPage";
import TeacherNewsPage from "./pages/Teacher/News/TeacherNewsPage";
import TeacherTestLearning from "./pages/Teacher/TeacherTestLearning";
import CheckoutTestLearning from './pages/Test&Learning/CheckoutTestLearning';
import TeacherBlogs from "./pages/Teacher/Blogs/TeacherBlogs";




import AdminCourseCategoryPage from './pages/Admin/AdminCourseCategoryPage';
import TeacherAssignmentsPage from './pages/Teacher/TeacherAssignmentsPage';
import AskDoubtSection from "./pages/AskDoubt/AskDoubtSection";
import ResearchReport from "./pages/ResearchReport/ResearchReport";
import ReportDetails from "./pages/ResearchReport/ReportDetails";
import Scholarship from "./pages/Scholarship/Scholarship";
import TestAndLearning from "./pages/Test&Learning/Test";
import TestDetails from "./pages/Test&Learning/TestDetails";
import Donation from "./pages/Donation/Donate";
import DonationAmount from "./pages/Donation/DonateAmount";
import AboutUs from "./pages/AboutUs/AboutUs";
import Career from "./pages/AboutUs/Career";
import JobDetail from "./pages/AboutUs/JobDetail";
import ContactDetails from "./pages/ContactUs/ContactDetails";
import News from "./pages/News/News";
import NewsDetails from "./pages/News/NewsDetails";
import Blog from "./pages/Blog/Blog";
import BlogDetails from "./pages/Blog/BlogDetail";
import ParentCompany from "./pages/ContactUs/ParentCompany";
import Ecommerce from "./pages/Ecommerce/EcommerceHome";
import Profile from "./pages/Ecommerce/MyProfile";
import MyOrder from "./pages/Ecommerce/MyOrder";
import Categories from "./pages/Ecommerce/Categories";
import ProductListPage from "./pages/Ecommerce/ProductListPage";
import ProductDetail from "./pages/Ecommerce/ProductDetail";
import Shop from "./pages/Ecommerce/Shop";
import Wishlist from "./pages/Ecommerce/Wishlist";
import Cart from "./pages/Ecommerce/Cart";
import Checkout from "./pages/Ecommerce/Checkout";
import Supplier from "./pages/Ecommerce/Supplier/Supplier";
import AddProduct from "./pages/Ecommerce/Supplier/AddProduct";
import ProductList from "./pages/Ecommerce/Supplier/ProductList";
import Orders from "./pages/Ecommerce/Supplier/Orders";
import SupplierApply from './pages/Ecommerce/Supplier/SupplierApply';
import SupplierChangePassword from './pages/Ecommerce/Supplier/ChangePassword';
import SupplierEditProfile from './pages/Ecommerce/Supplier/EditProfile';
import OrderConfirmation from './pages/Ecommerce/OrderConfirmation';
import Achievers from './pages/Achievers/achievers';
import TestLearning from "./pages/Student/StudentTestDetails";
import TeacherSeriesTests from "./pages/Teacher/TeacherSeriesTests";
import TeacherTestQuestions from "./pages/Teacher/TeacherTestQuestions";
import LiveTest from "./pages/Student/LiveTest";
import TestReport from "./pages/Student/TestReport";
import StudentAnnouncementsPage from "./pages/Student/StudentAnnouncementsPage";
import TeacherAnnouncementsPage from "./pages/Teacher/TeacherAnnouncementsPage";
import ParentMessagesPage from "./pages/Parent/ParentMessagesPage";
import TeacherParentDoubtsPage from "./pages/Teacher/TeacherParentDoubtsPage";
import SupplierApprovalPage from './pages/Admin/Ecom/SupplierApprovalPage';
import DonationConfirmation from './pages/Donation/DonationConfirmation';
import AdminCareerJobs from "./pages/Admin/Career/AdminCareerJobs";
import AdminCareerApplications from "./pages/Admin/Career/AdminCareerApplications";

function App() {
  return (
    <ToastProvider>
    <ConfirmProvider>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/courses" element={<Courses />} />
      <Route path="/categories/:category" element={<CategoryCourses />} />
      <Route path="/courses/:slug" element={<PublicCourseDetail/>}/>
      <Route path="/checkout/:courseId" element={<CheckoutPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/student-dashboard" element={<StudentDashboard/>}/>
      <Route path="/student/live-classes" element={<LiveClasses />} />
      <Route path="/student/my-courses" element={<MyCourses/>}/>
      <Route path="/student/test-series" element={<MyTestSeries/>}/>
      <Route path="/student/study-materials" element={<StudyMaterials/>}/>
      <Route path="/student/practice" element={<Practice />} />
      <Route path="/student/practice/:courseId" element={<Practice />} />
      <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentViewPage />} />
      <Route path="/student/quizzes/:quizId/start" element={<StudentQuizStartPage />} />
      <Route path="/student/quizzes/:quizId/result" element={<StudentQuizResultPage />} />
      <Route path="/student/quizzes/:quizId/attempts" element={<StudentQuizAttemptsPage />} />
      <Route path="/student/all-test-series" element={<AllTestSeries/>}/>
      <Route path="/student/all-courses" element={<AllCourses/>}/>
      <Route path="/student/edit-profile" element={<EditProfile />} />
      <Route path="/store" element={<StorePage/>}/>
      <Route path="/student/change-password" element = {<ChangePassword/>}/>
      <Route path="/student/doubts" element={<Doubts/>}/>
      <Route path="/student/courses/:courseId/modules" element={<StudentCourseModulesPage />} />
      <Route path="/student/courses/:courseId/modules/:moduleId" element={<StudentModuleLessonsPage />} />

      <Route path="/teacher-dashboard" element={<TeacherCoursesPage />} />
      <Route path="/teacher/add-modules" element={<AddModulesPage />} />
      <Route path= "/teacher/publish-course" element ={<PublishCoursePage/>}/>
      <Route path="/teacher/course/:courseId" element={<CourseManagement />} />
      <Route path="/teacher/add-modules" element={<AddModulesPage />} />
      <Route path="/teacher/assessment/assignment/:courseId" element={<CreateAssignmentPage />} />
      <Route path="/teacher/assessment/assignments/:courseId" element={<TeacherAssignmentsPage />} />
      <Route path="/teacher/payments" element={<TeacherPaymentsPage/>}/>
      <Route path="/teacher/assessment/quiz/:courseId" element={<CreateQuizPage />} />
      <Route path="/teacher/assessment/quizzes/:courseId" element={<TeacherQuizzesPage />} />
      <Route path="/teacher/assessment/quizzes/view/:quizId" element={<TeacherQuizDetailsPage />} />
      <Route path="/teacher/reports-certifications" element={<TeacherReportsCertificationsPage/>}/>
      <Route path="/teacher/assessment/submissions" element={<ViewSubmissionsPage />} />
      <Route path="/teacher/assessments/review" element={<ReviewSubmissionsPageWrapper />} />
      <Route path="/teacher/students/performance" element={<StudentsPerformancePage />} />
      <Route path= "/teacher/queries/doubts" element = {<QueriesDoubtsPage/>}/>
      <Route path="/teacher/change-password" element = {<ChangePasswordTeacher/>}/>
      <Route path="/teacher/studymaterials"  element = {<TeacherStudyMaterials/>}/>
      <Route path="/admin/confirm-admin" element={<AdminConfirmAdminPage/>}/>
      <Route path="/teacher/course/:courseId/module/:moduleId" element={<TeacherModuleContentPage />}/>
      <Route path="/admin/confirmTeacher" element={<AdminConfirmTeacherPage />} />
      <Route path="/teacher/edit-profile" element = {<EditProfilePage/>}/>
      <Route path="/parent-dashboard" element = {<ParentDashboard/>}/>
      <Route path="/parent/students" element = {<ParentStudentsPage/>}/>
      <Route path="/parent/students/:id" element={<StudentDetailsPage />} />
      <Route path="/parent/reports-certifications" element={<ParentReportsCertificationsPage />}/>

      <Route path="/parent/announcements" element={<ParentAnnouncementsPage/>}/>
      <Route path="/parent/payments" element={<ParentPaymentsPage/>}/>
      <Route path="/parent/settings" element={<ParentSettingsPage/>}/>
      <Route path="/parent/change-password" element={<ParentChangePasswordPage/>}/>
      <Route path="/admin-dashboard" element = {<AdminDashboardPage/>}/>
      <Route path="/admin/students" element= {<AdminAllStudentsPage/>}/>

      <Route path="/admin/teachers" element={<AdminAllTeachersPage/>}/>

      <Route path="/admin/fees/collection" element={<FeesCollectionPage/>}/>
      <Route path="admin/fees/addfees" element={<AddFeesPage/>}/>
      <Route path="/admin/fees/receipt/:receiptId" element={<FeesReceiptPage />} />
      <Route path="/admin/announcements" element ={<AdminAnnouncementsPage/>}/>
      <Route path="/admin/announcements/create" element = {<AddAnnouncementPage/>}/>
      <Route path="/admin/courses" element={<AdminCoursesPage/>}/>
      <Route path="/admin/courses/:courseId" element={<AdminCourseDetailPage />} />
      <Route path="/admin/courses/:courseId/edit" element={<EditCoursePage/>}/>
      <Route path="/admin/courses/add" element={<AddCoursePage/>}/>
      <Route path="/admin/ecom/orders" element={<EcomOrdersPage />} />
      <Route path="/admin/ecom/orders/:id" element={<OrderDetailsPage />} />
      <Route path="/admin/ecom/customers" element={<CustomersPage/>}/>
      <Route path="/admin/ecom/customers/:id" element={<CustomerDetailsPage/>}/>
      <Route path="/admin/ecom/categories" element={<CategoriesPage/>}/>
      <Route path="/admin/ecom/transaction" element={<TransactionsPage/>}/>

      <Route path="/admin/change-password" element={<AdminChangePassword/>}/>
      <Route path="/admin/settings" element={<SettingsPage/>}/>
      <Route path="/admin/ecom/products/add" element= {<AdminAddProduct/>}/>
      <Route path="/admin/courses/purchaseList" element={<CoursePurchaseList/>}/>
      <Route path="/admin/ecom/products/purchase" element = {<EcomProductList/>}/>
      <Route path="/admin/scholarship" element={<AdminScholarshipPage />} />
      <Route path="/teacher/research" element={<AdminResearchPage />} />
      <Route path="/admin/donations" element={<AdminDonationsPage />} />  
      <Route path="/admin/doubts" element={<AdminDoubtsPage />} />
      <Route path="/admin/achievers" element={<AdminAchieversPage />} />
      <Route path="/admin/contacts" element={<AdminContactsPage />} />
      <Route path="/teacher/news" element={<TeacherNewsPage />} />
      <Route path="/teacher/test-learning" element={<TeacherTestLearning />} />
      <Route path="/checkout-test-learning/:id" element={<CheckoutTestLearning />} />
      <Route path="/student-test-learning/:id" element={<TestLearning />} />
      <Route path="/teacher/series-tests/:id" element={<TeacherSeriesTests />} />
      <Route path="/teacher/series-tests/:id/tests/:testId/questions" element={<TeacherTestQuestions />} />
      <Route path="/student/series/:seriesId/tests/:testId/live" element={<LiveTest />} />
      <Route path="/parent/messages" element={<ParentMessagesPage />} />
      <Route path="/teacher/doubts" element={<TeacherParentDoubtsPage />} />
      <Route path="/admin/ecom/suppliers" element={<SupplierApprovalPage />} />
      <Route path="/donation-confirmation/:id" element={<DonationConfirmation />} />


      <Route path="/admin/courses/category"  element={<AdminCourseCategoryPage/>}/>

      <Route path="/ask-doubt" element={<AskDoubtSection />} />
      <Route path="/research-report" element={<ResearchReport />} />
      <Route path="/research-report/:slug" element={<ReportDetails />} />
      <Route path="/scholarship" element={<Scholarship />} />
      <Route path="/test-learning" element={<TestAndLearning />} />
      <Route path="/test-learning/:id" element={<TestDetails />} />
      <Route path="/donate" element={<Donation />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/donate-amount" element={<DonationAmount />} />
      <Route path="/career" element={<Career />} />
      <Route path="/career/:id" element={<JobDetail />} />
      <Route path="/contact-us" element={<ContactDetails />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:slug" element={<NewsDetails />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogDetails />} />
      <Route path="/parent-company" element={<ParentCompany />} />
      <Route path="/ecommerce-home" element={<Ecommerce />} />
      <Route path="/my-profile" element={<Profile />} />
      <Route path="/my-order" element={<MyOrder />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/products/:type" element={<ProductListPage />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/my-cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/supplier" element={<Supplier />} />
      <Route path="/supplier/add-product" element={<AddProduct />} />
      <Route path="/supplier/product-list" element={<ProductList />} />
      <Route path="/supplier/orders" element={<Orders />} />
      <Route path="/supplier/apply" element={<SupplierApply />} />
      <Route path="/supplier/change-password" element={<SupplierChangePassword />} />
      <Route path="/supplier/edit-profile" element={<SupplierEditProfile />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/achievers" element={<Achievers />} />
      <Route path="/teacher/blogs" element={<TeacherBlogs />} />
      <Route path="/student/series/:seriesId/tests/:testId/report" element={<TestReport />} />
      <Route path="/student/announcements" element={<StudentAnnouncementsPage />} />
      <Route path="/teacher/announcements" element={<TeacherAnnouncementsPage />} />
      <Route path="/admin/career/jobs" element={<AdminCareerJobs />} />
      <Route path="/admin/career/applications" element={<AdminCareerApplications />} />
    </Routes> 
    </ConfirmProvider>
    </ToastProvider>
  )
}
export default App
