const fs = require("fs")
const path = require("path")
const { json } = require("stream/consumers")

const filePath = path.join(__dirname, "../data/account.json")

const data = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/account.json"),
    "utf-8"
  )
)

const finddata = (datafind) => {
const hasil  = data.find(hasil => hasil.username === datafind.username)
 return hasil
}


const findke2 = (data) => {
  const hasil  = data.find(hasil => hasil.username === data)
 return hasil
}
const cekdata = (datasystem) => {
   return finddata(datasystem)
}

const tambahuser = (userbaru) =>{
    
    
    const user = data
    const usertambahdata = {...userbaru , data : []}
    user.push(usertambahdata)


    fs.writeFileSync(
    filePath,
    JSON.stringify(user, null, 2)
  )
}



const tambahkegitan = (datauser) => {
  const findacc = finddata(datauser)

  if (!findacc) {
    return false
  }

  findacc.data.push(datauser.data)

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  )
 

  return true
}



const deleteTodolist = (hasildata) => {
  const find = finddata(hasildata)
 
  find.data.splice(hasildata.body , 1)
 
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  )
 
}


const updateselesai = (datahasil) => {
    const find = finddata(datahasil)
    find.data[datahasil.body][1] = "selesai"

    
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  )
    
}


const updatebelumselesai = (datafromfe) => {
    const find = finddata(datafromfe)
    find.data[datafromfe.body][1] = "belum selesai"

    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null , 2)
    )

}

const deleteall= (datafromfe) => {
  const find =finddata(datafromfe)

  datafromfe.sortedIndex.forEach(element => {
    find.data.splice(element, 1)
  });

   fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  )
}

module.exports = {cekdata , tambahuser , tambahkegitan, finddata, findke2 , deleteTodolist , updateselesai, updatebelumselesai, deleteall}


