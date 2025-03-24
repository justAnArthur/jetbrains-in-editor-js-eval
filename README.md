```javascript
function a() {
  return 1
}

let c = 3
const b = 2
c = a() + b
c += b

console.log(c) 
```

-> #10

`deps: [c]`

