import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { OrderInfo } from '../order-info';
import { IngredientDetails } from '../ingredient-details';
import { Modal } from '../modal';
import { useDispatch } from '../../services/store';
import { useEffect } from 'react';
import { getIngredients } from 'src/slices/ingredientsSlice';
const location = useLocation();
const background = location.state?.background;
const navigate = useNavigate();

useEffect(() => {
  useDispatch(getIngredients());
}, []);

const handleCloseModal = () => {
  navigate(-1);
};

const App = () => (
  <div className={styles.app}>
    <Routes>
      <Route path='/' element={<ConstructorPage />} />
      <Route path='/feed' element={<Feed />} />
      <Route
        path='/feed/:numder'
        element={
          <Modal title='' onClose={handleCloseModal}>
            <OrderInfo />{' '}
          </Modal>
        }
      />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-profile' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/profile/orders' element={<ProfileOrders />} />
      <Route
        path='/ingredients/:id'
        element={
          <Modal title='' onClose={handleCloseModal}>
            <IngredientDetails />{' '}
          </Modal>
        }
      />
      <Route
        path='/profile/orders/:number'
        element={
          <Modal title='' onClose={handleCloseModal}>
            <OrderInfo />{' '}
          </Modal>
        }
      />
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  </div>
);
export default App;
