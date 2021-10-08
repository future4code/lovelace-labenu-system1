import { connection } from "./connections";


const printError = (error: any) => {console.log(error.sqlMessage || error.message)}

const createTable = () => connection
.raw (`







`) 
.then (() => { console.log('Tabelas Criadas')})
.catch(printError)

const insert = () => connection ()
.insert(undefined)
.then (() => {console.log("Usuários Criados")})
.catch (printError)


const closeConnection =()=> {connection.destroy ()}

createTable()
.then ()
.finally (closeConnection)