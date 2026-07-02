import { useMemo, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

import { RootContext } from '../pages/_app'

const WithAxios = ({ children }) => {
  const rootContext = useContext(RootContext)

  useMemo(() => {
    axios.defaults.baseURL = process.env.baseURL
    axios.defaults.timeout = 60000
    axios.defaults.withCredentials = false

    axios.interceptors.request.use(
      async function (config) {
        var headers = { ...config.headers }
        let user = null;
        if (typeof window !== 'undefined') {
          user = localStorage.getItem('dataLogin')
            ? JSON.parse(localStorage.getItem('dataLogin'))
            : null
        }

        if (user && user?.token) {
        }

        if (user && user.token) {
          const { token } = user
          headers['Authorization'] = `${token}`
        }

        config.headers = headers
        return config
      },
      (error) => {
        if (error && error.request) {
        }
        return Promise.reject(error)
      }
    )
    axios.interceptors.response.use(
      async (response) => {
        if (response.status === 401) {
          toast(response.data.message, {
            position: 'top-right',
            autoClose: 5000,
            type: 'error',
          })
          rootContext.handleLogout()
        }

        return {
          response,
          data: response.data,
        }
      },
      (error) => {
        toast(error?.response?.data?.message, {
          type: 'error',
        })

        if (error.message === 'Network Error') {
          return {
            response: { status: 1001, message: error.message },
            data: { message: error.message },
          }
        } else if (error && error.response && error.response.status === 401) {
          // redirect to login

          rootContext.handleLogout()
        }
        return { response: error.response, data: error?.response?.data ?? {} }
      }
    )
  }, [])

  return children
}

export default WithAxios
