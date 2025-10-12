import { LOCAL_API_URL, LIVE_API_URL } from './environments'

const URL = LOCAL_API_URL || LIVE_API_URL
const API_URL = URL + '/assets/stamp/'
export default API_URL
