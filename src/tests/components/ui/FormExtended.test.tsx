import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { useForm } from 'react-hook-form'
import React from 'react'

describe('Form Components - Extended Coverage', () => {
  describe('Form with FormField', () => {
    it('should render form with all components', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            username: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormDescription>This is your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
      expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
    })

    it('should render form with error message', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            email: '',
          },
        })

        // Manually set an error
        React.useEffect(() => {
          form.setError('email', {
            type: 'manual',
            message: 'Email is required',
          })
        }, [form])

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('should render form without error message when no error', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            name: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      // FormMessage should not render when there's no error and no children
      const formMessage = container.querySelector('[data-slot="form-message"]')
      expect(formMessage).not.toBeInTheDocument()
    })

    it('should render FormMessage with custom children', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>Custom message</FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('Custom message')).toBeInTheDocument()
    })

    it('should render form with error and description', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            password: '',
          },
        })

        React.useEffect(() => {
          form.setError('password', {
            type: 'manual',
            message: 'Password is too weak',
          })
        }, [form])

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('Must be at least 8 characters.')).toBeInTheDocument()
      expect(screen.getByText('Password is too weak')).toBeInTheDocument()
    })

    it('should render FormControl with error state', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        React.useEffect(() => {
          form.setError('field', {
            type: 'manual',
            message: 'Error',
          })
        }, [form])

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should render FormControl without error state', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Description</FormDescription>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should render multiple form fields', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should render FormLabel with error styling', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        React.useEffect(() => {
          form.setError('field', {
            type: 'manual',
            message: 'Error',
          })
        }, [form])

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label with Error</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      const label = container.querySelector('[data-slot="form-label"]')
      expect(label).toHaveAttribute('data-error', 'true')
    })

    it('should render FormLabel without error styling', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label without Error</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      const label = container.querySelector('[data-slot="form-label"]')
      expect(label).toHaveAttribute('data-error', 'false')
    })

    it('should render form with custom className', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem className="custom-item">
                    <FormLabel className="custom-label">Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="custom-description">Description</FormDescription>
                    <FormMessage className="custom-message" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      const { container } = render(<TestForm />)

      expect(container.querySelector('.custom-item')).toBeInTheDocument()
      expect(container.querySelector('.custom-label')).toBeInTheDocument()
      expect(container.querySelector('.custom-description')).toBeInTheDocument()
    })

    it('should render FormMessage with error message object', () => {
      const TestForm = () => {
        const form = useForm({
          defaultValues: {
            field: '',
          },
        })

        React.useEffect(() => {
          form.setError('field', {
            type: 'manual',
            message: 'Complex error message',
          })
        }, [form])

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )
      }

      render(<TestForm />)

      expect(screen.getByText('Complex error message')).toBeInTheDocument()
    })
  })
})
