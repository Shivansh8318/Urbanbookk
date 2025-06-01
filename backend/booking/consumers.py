import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import AvailabilitySlot, Booking
from teacher.models import Teacher
from student.models import Student

class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'booking_{self.user_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'add_slot':
                await self.add_slot(data)
            elif action == 'book_slot':
                await self.book_slot(data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON data'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def add_slot(self, data):
        teacher_user_id = data.get('teacher_id')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        try:
            # Validate required fields
            if not all([teacher_user_id, date, start_time, end_time]):
                raise ValueError("Missing required fields: teacher_id, date, start_time, or end_time")

            # Fetch the teacher using user_id
            teacher = await database_sync_to_async(Teacher.objects.get)(user_id=teacher_user_id)

            # Create the slot
            slot = await database_sync_to_async(AvailabilitySlot.objects.create)(
                teacher=teacher,
                date=date,
                start_time=start_time,
                end_time=end_time,
            )

            # Send the slot update with the teacher's user_id
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'slot_update',
                    'slot': {
                        'id': slot.id,
                        'teacher_id': teacher.user_id,
                        'date': str(slot.date),
                        'start_time': str(slot.start_time),
                        'end_time': str(slot.end_time),
                        'is_booked': slot.is_booked,
                    }
                }
            )
        except Teacher.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Teacher not found'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def book_slot(self, data):
        slot_id = data.get('slot_id')
        student_id = data.get('student_id')

        try:
            # Validate required fields
            if not slot_id or not student_id:
                raise ValueError("Missing required fields: slot_id or student_id")

            # Fetch the slot and student
            slot = await database_sync_to_async(AvailabilitySlot.objects.get)(id=slot_id)
            student = await database_sync_to_async(Student.objects.get)(user_id=student_id)

            # Check if the slot is already booked (wrap in a function to use database_sync_to_async)
            @database_sync_to_async
            def is_slot_booked(slot_obj):
                return slot_obj.is_booked

            if await is_slot_booked(slot):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'error',
                        'message': 'Slot is already booked'
                    }
                )
                return

            # Mark the slot as booked
            @database_sync_to_async
            def mark_slot_booked(slot_obj):
                slot_obj.is_booked = True
                slot_obj.save()
                return slot_obj

            slot = await mark_slot_booked(slot)

            # Create the booking with the Student object
            @database_sync_to_async
            def create_booking(slot_obj, student_obj):
                return Booking.objects.create(
                    slot=slot_obj,
                    student=student_obj,
                    status='pending'
                )

            booking = await create_booking(slot, student)

            # Notify the teacher's group (using teacher's user_id)
            @database_sync_to_async
            def get_teacher_user_id(slot_obj):
                return slot_obj.teacher.user_id

            teacher_user_id = await get_teacher_user_id(slot)
            await self.channel_layer.group_send(
                f'booking_{teacher_user_id}',
                {
                    'type': 'booking_update',
                    'booking': {
                        'id': booking.id,
                        'slot_id': slot.id,
                        'student_id': student.user_id,
                        'status': booking.status,
                    }
                }
            )

            # Notify the student's group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'booking_update',
                    'booking': {
                        'id': booking.id,
                        'slot_id': slot.id,
                        'student_id': student.user_id,
                        'status': booking.status,
                    }
                }
            )
        except AvailabilitySlot.DoesNotExist:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'error',
                    'message': 'Slot not found'
                }
            )
        except Student.DoesNotExist:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'error',
                    'message': 'Student not found'
                }
            )
        except Exception as e:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'error',
                    'message': str(e)
                }
            )

    async def slot_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'slot_update',
            'slot': event['slot']
        }))

    async def booking_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'booking_update',
            'booking': event['booking']
        }))

    async def error(self, event):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event.get('message', 'An error occurred')
        }))