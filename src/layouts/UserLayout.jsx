// layouts/UserLayout.js
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserLayout = ({ children, transparentNav = false }) => (
  <>
    <Navbar transparent={transparentNav} />
    <main style={{ paddingTop: transparentNav ? 0 : 76 }}>
      {children}
    </main>
    <Footer />
    <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar />
  </>
);

export default UserLayout;
