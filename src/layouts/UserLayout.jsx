// layouts/UserLayout.js
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserLayout = ({ children, transparentNav = false }) => (
  <>
    <Navbar transparent={transparentNav} />
    <main className={transparentNav ? '' : 'pt-[76px]'} style={transparentNav ? {} : { minHeight: '100vh' }}>
      <div className="min-w-0 w-full overflow-x-hidden">{children}</div>
    </main>
    <Footer />
    <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar />
  </>
);

export default UserLayout;
