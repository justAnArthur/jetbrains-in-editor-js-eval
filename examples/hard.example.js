const version = "1.0.1"

function sum(a, b) {
  return a + b
}

function difference(a, b) {
  return a - b
}

function product(a, b) {
  return a * b
}

function quotient(a, b) {
  return b === 0 ? NaN : a / b
}

function isPrime(n) {
  if (n <= 1) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

function fibonacci(n) {
  if (n < 2) return n
  let p = 0, c = 1
  for (let i = 2; i <= n; i++) {
    [p, c] = [c, p + c]
  }
  return c
}

const PI = 3.141592653589793
const E = 2.718281828459045
let store = {}

function setKey(k, v) {
  store[k] = v
}

function getKey(k) {
  return store[k]
}

function hasKey(k) {
  return Object.prototype.hasOwnProperty.call(store, k)
}

function removeKey(k) {
  delete store[k]
}

function clearStore() {
  store = {}
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return Math.abs(a)
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

function toArray(iterable) {
  return [...iterable]
}

function uniqueArray(arr) {
  return [...new Set(arr)]
}

function flattenArray(arr) {
  return arr.reduce((acc, v) => acc.concat(Array.isArray(v) ? flattenArray(v) : v), [])
}

function chunkArray(arr, size) {
  let r = []
  for (let i = 0; i < arr.length; i += size) {
    r.push(arr.slice(i, i + size))
  }
  return r
}

function randomElement(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const now = () => Date.now()
const timestamp = () => Math.floor(Date.now() / 1000)

function formatDate(d) {
  return d.toISOString()
}

async function fetchJson(url) {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error("Network error")
  return resp.json()
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function memoize(fn) {
  const c = {}
  return (...a) => {
    const k = JSON.stringify(a)
    if (c[k] === undefined) {
      c[k] = fn(...a)
    }
    return c[k]
  }
}

function curry(fn) {
  return function curried(...a) {
    if (a.length >= fn.length) {
      return fn(...a)
    }
    return (...m) => curried(...a, ...m)
  }
}

function partial(fn, ...preset) {
  return (...later) => fn(...preset, ...later)
}

function compose(...fns) {
  return x => fns.reduceRight((acc, f) => f(acc), x)
}

function pipe(...fns) {
  return x => fns.reduce((acc, f) => f(acc), x)
}

function debounce(fn, wait) {
  let t = null
  return (...a) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), wait)
  }
}

function throttle(fn, limit) {
  let inT = false
  return (...a) => {
    if (!inT) {
      fn(...a)
      inT = true
      setTimeout(() => inT = false, limit)
    }
  }
}

function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function range(start, end, step = 1) {
  let r = []
  for (let i = start; i < end; i += step) {
    r.push(i)
  }
  return r
}

function reverseString(str) {
  return [...str].reverse().join("")
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function isPalindrome(str) {
  const s = str.replace(/[\W_]/g, "").toLowerCase()
  return s === [...s].reverse().join("")
}

let counter = 0

function incCounter() {
  counter++
  return counter
}

function resetCounter() {
  counter = 0
}

function factorial(n) {
  if (n < 0) return NaN
  let f = 1
  for (let i = 2; i <= n; i++) {
    f *= i
  }
  return f
}

function greet(name) {
  return "Hello, " + name + "!"
}

let val1 = sum(2, 3)
let val2 = difference(val1, 1)
let val3 = product(val2, 10)
let fib5 = fibonacci(5)
let primeCheck = isPrime(13)
let randInt = randomInt(1, 100)
let randFloat = randomFloat(1, 5)
let greeting = greet("Alice")
let limitedVal = clamp(15, 0, 10)
let counterValue = incCounter()
let fact5 = factorial(5)
let sequence = range(0, 5)
let flattened = flattenArray([1, [2, [3, 4]], 5])
let endMsg = "End of script"


