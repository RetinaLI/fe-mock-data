function aa(a, b) {
  if (!b) {
    console.log('只穿了一个下那护士');
  }
  console.log(a +":" + b);
};

aa("aaagg");
let obj = {
  hah: {haha: 11},
  feff: {haha: 11},
  feggg: {haha: 11}
}
Object.keys(obj).forEach( key => {
  console.log(key);
  console.log(obj[key]);
})