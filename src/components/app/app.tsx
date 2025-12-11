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
import { Route, Routes } from 'react-router-dom';
import { OrderInfo } from '../order-info';
import { IngredientDetails } from '../ingredient-details';

const App = () => (
  <div className={styles.app}>
    <Routes>
      <Route path='/' element={<ConstructorPage />} />
      <Route path='/feed' element={<Feed />} />
      <Route path='/feed/:numder' element={<OrderInfo />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-profile' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/profile/orders' element={<ProfileOrders />} />
      <Route path='/ingredients/:id' element={<IngredientDetails />} />
      <Route path='/profile/orders/:number' element={<OrderInfo />} />
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  </div>
);
export default App;
