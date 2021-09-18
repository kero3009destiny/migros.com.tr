import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NoAuthGuard, RouteGuard } from '@fe-commerce/core';

import {
  ROUTE_EMAIL_UNSUBSCRIBE,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_LOGIN,
  ROUTE_RESET_PASSWORD,
  ROUTE_SACRIFICE,
  ROUTE_SIGNUP,
} from '../routes';

import { AuthComponent } from './components';
import { EmailUnsubscribePage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages';

const authRoutes = [
  {
    path: '',
    component: AuthComponent,
    canActivate: [RouteGuard],
    children: [
      {
        path: ROUTE_LOGIN,
        component: LoginPage,
        canActivate: [NoAuthGuard],
        data: { title: 'Giriş | Sanalmarket', screenName: 'Login' },
      },
      {
        path: ROUTE_SIGNUP,
        component: RegisterPage,
        canActivate: [NoAuthGuard],
        data: { title: 'Kayıt ol | Sanalmarket', screenName: 'Register' },
      },
      {
        path: ROUTE_FORGOT_PASSWORD,
        component: ForgotPasswordPage,
        canActivate: [NoAuthGuard],
        data: { title: 'Şifremi Unuttum | Sanalmarket', screenName: 'Forgot Password' },
      },
      {
        path: ROUTE_RESET_PASSWORD,
        component: ResetPasswordPage,
        canActivate: [NoAuthGuard],
        data: { title: 'Hesap kurtar | Sanalmarket', noIndex: true },
      },
      {
        path: ROUTE_EMAIL_UNSUBSCRIBE,
        component: EmailUnsubscribePage,
        data: { title: 'Email | Sanalmarket', screenName: 'Email Unsubscribe' },
      },
    ],
  },
];
const routes: Routes = [
  {
    path: ROUTE_SACRIFICE,
    canActivate: [RouteGuard],
    children: authRoutes,
  },
  ...authRoutes,
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmAuthRoutingModule {}
