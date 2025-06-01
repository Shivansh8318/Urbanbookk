from django.urls import path
from .views import CreateOrderView, VerifyPaymentView, PaymentDetailsView

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('payment-details/', PaymentDetailsView.as_view(), name='payment-details'),
    path('payment-details/<int:booking_id>/', PaymentDetailsView.as_view(), name='payment-details-by-booking'),
] 