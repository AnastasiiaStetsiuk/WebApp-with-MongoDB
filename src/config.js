import dotenv from 'dotenv'

dotenv.config()

export const CWD = process.cwd() + '/src'
export const PORT = +process.env.PORT || 4000
export const DB_NAME = 'Lab_3'
export const DB_CONNSTR = process.env.DB_CONNSTR.replace('<db>', DB_NAME)
