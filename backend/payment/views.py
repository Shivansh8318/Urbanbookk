from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import razorpay
import logging
from booking.models import Booking
from .models import Payment
from .serializers import PaymentSerializer, CreateOrderSerializer, VerifyPaymentSerializer

logger = logging.getLogger(__name__)

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreateOrderView(APIView):
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                booking = Booking.objects.get(id=serializer.validated_data['booking_id'])
                amount = int(float(serializer.validated_data['amount']) * 100)  # Convert to paise
                currency = serializer.validated_data['currency']
                receipt = f"booking_{booking.id}"
                
                # Create Razorpay Order
                razorpay_order = client.order.create({
                    'amount': amount,
                    'currency': currency,
                    'receipt': receipt,
                })
                
                # Save order in database
                payment = Payment.objects.create(
                    booking=booking,
                    order_id=razorpay_order['id'],
                    amount=float(amount)/100,  # Convert back to rupees for database
                    currency=currency,
                    receipt=receipt
                )
                
                # Create response data
                data = {
                    'order_id': razorpay_order['id'],
                    'amount': amount,
                    'currency': currency,
                    'key': settings.RAZORPAY_KEY_ID,
                }
                
                return Response(data, status=status.HTTP_201_CREATED)
            except Booking.DoesNotExist:
                return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error creating order: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyPaymentView(APIView):
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Verify signature
                params_dict = {
                    'razorpay_order_id': serializer.validated_data['order_id'],
                    'razorpay_payment_id': serializer.validated_data['payment_id'],
                    'razorpay_signature': serializer.validated_data['signature']
                }
                
                # Verify the payment signature
                client.utility.verify_payment_signature(params_dict)
                
                # Update payment details in database
                payment = Payment.objects.get(order_id=params_dict['razorpay_order_id'])
                payment.payment_id = params_dict['razorpay_payment_id']
                payment.status = 'paid'
                payment.save()

                # Update booking status
                booking = payment.booking
                booking.status = 'confirmed'
                booking.save()
                
                return Response(
                    {'status': 'Payment successful'}, 
                    status=status.HTTP_200_OK
                )
            except razorpay.errors.SignatureVerificationError:
                return Response(
                    {'error': 'Invalid signature'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Payment.DoesNotExist:
                return Response(
                    {'error': 'Order not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                logger.error(f"Error verifying payment: {str(e)}")
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentDetailsView(APIView):
    def get(self, request, booking_id=None):
        if booking_id:
            try:
                payments = Payment.objects.filter(booking_id=booking_id).order_by('-created_at')
                serializer = PaymentSerializer(payments, many=True)
                return Response(serializer.data)
            except Payment.DoesNotExist:
                return Response(
                    {'error': 'Payment not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        payments = Payment.objects.all().order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
