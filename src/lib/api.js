import * as Api from 'lib/apiMethod';

/* Internal API */
export const SignIn = Api.signin;
export const SignUp = Api.signup;
export const GetMarketSubs = Api.getMarketSubs;

/* Market API */
export const GetBalance = Api.getBalance;
export const OrderSend  = Api.orderSend;
export const GetOrderinfo  = Api.getOrderinfo;
export const GetOrderdetail  = Api.getOrderdetail;
export const RefreshOrders   = Api.refreshOrders;



