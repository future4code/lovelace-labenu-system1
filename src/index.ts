import express, {Express, Response, Request} from 'express'
import cors from 'cors'
import knex from "knex";
import dotenv from 'dotenv'
import { AddressInfo } from "net";

dotenv.config()

export const connection = knex({
	client: "mysql",
	connection: {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    multipleStatements: true
  }
});

const app: Express = express();

app.use(express.json());
app.use(cors());

enum CLASS_TYPE {
    INTEGRAL = 'integral',
    NOTURNO = "noturno"
}

enum SPECIALTY {
    REACT=1,
    REDUX=2,
    CSS=3,
    TESTES=4,
    TYPESCRIPT=5,
    POO=6,
    BACKEND=7
}

type createClassInput = {
 id: number ,
name: string ,
startDate: string ,
endDate: string ,
module:  number,
type: CLASS_TYPE
}

type createStudentInput = {
    id: number ,
   name: string ,
   email: string,
   birthDate: string ,
   hobbies: string [],
   class_id: number
   }

   type createTeacherInput = {
    id: number ,
   name: string ,
   email: string,
   birthDate: string ,
   specialty: SPECIALTY [],
   class_id: number
   }

   type updateStudentInput ={
student_id: number,
class_id: number
   }

   type updateTeacherInput ={
    teacher_id: number,
    class_id: number
       }

app.post ("/class", async (req: Request, res: Response)=>{
    let errorCode = 400;
    try {
        const input: createClassInput = {
 id: req.body.id ,
name: req.body.name ,
startDate: req.body.startDate ,
endDate: req.body.endDate,
module:  0,
type: req.body.type
        }
        if(!input.id|| !input.name || !input.startDate
            || !input.endDate || !input.type){
                errorCode = 422
                throw new Error("Preencha os campos corretamente.")
            }
            if (input.type !== CLASS_TYPE.INTEGRAL && input.type !== CLASS_TYPE.NOTURNO){
                errorCode = 422
                throw new Error("Os valores possiveis são 'integral' ou 'noturno'")

            }
            if (input.type === CLASS_TYPE.NOTURNO){
                input.name = input.name+="-na-night"
            }

            await connection.raw(`
            INSET INTO CLASS (id, name, startDate, endDate, module)
            VALUES(
                ${input.id}
                "${input.name}"
                "${input.startDate}"
                "${input.endDate}"
                "${input.module}"
            )
            `)
        res.status(201).send({ message:"Turma criada com sucesso."})


    }catch (error) {
        res.status(errorCode).send({message: error})
    }
})

app.post ("/student", async (req: Request, res: Response)=>{
let errorCode = 400
try {
    const input: createStudentInput = {
        id: req.body.id ,
       name: req.body.name ,
       email: req.body.email,
       birthDate: req.body.birthDate ,
       hobbies: req.body.hobbies,
       class_id: req.body.class_id
    }

    if(!input.id|| !input.name || !input.birthDate
        || input.hobbies.length>1 ){
            errorCode = 422
            throw new Error("Preencha os campos corretamente.")
        }

        await connection.raw(`
        ISERT INTO STUDENT(id, name, email, birthDate, class_id)
        VALUES (
            ${input.id},
            "${input.name}",
            "${input.email}",
            "${input.birthDate}",
            "${input.class_id}"
        );

        `)

        for (let hobby of input.hobbies){
            const idHobby = Math.floor(Math.random()*1000000)
            await connection.raw(`
            ISENT INTO HOBBY(id, name)
            VALUES(
                ${idHobby},
                "${hobby}"
            )
            `)

            await connection.raw(`
            ISENT INTO STUDENT_HOBBY(student_id, hobby_id)
            VALUES(
                ${input.id},
                ${idHobby}
            )
            `)
            
        }

        res.status(201).send({message: "Criado com sucesso"})

}catch (error) {
    res.status(errorCode).send({message: error})
}

})

app.put("/student", async (req: Request, res: Response)=>{
  let erroCode =400;
  try {

    const input: updateStudentInput = {
        student_id: req.body.student_id,
        class_id: req.body.class_id
    }

    await connection.raw (`
    UPDATE STUDENT 
    SET class_id = ${input.class_id}
    WHERE id = ${input.student_id}
    `)

    res.status(200).send({message: "Atualizado com sucesso!"})

  }  catch (error) {
      res.status(erroCode).send({message: error})
  }
})

app.get("/student/:id", async (req: Request, res: Response)=>{
   let errorCode = 400
    try {

        const id = req.params.id

        if (isNaN(Number(id))){
            throw new Error ("Apenas valores numéricos")
        }

        const result = await connection.raw(`
        SELECT ROUND (DATEDIFF("2021-01-01", birthDate)/365)
        FROM STUDENT
        WHERE id ${id}
        `)

        if (result[0].length === 0 ){
            errorCode = 404
            throw new Error("Não encontrado")
        }

        res.status(200).send({student: result [0] [0]})
    }  catch (error) {
        res.status(errorCode).send({message: error})
    }

})

app.post ("/teacher", async (req: Request, res: Response)=>{
    let errorCode = 400
    try {
        const input: createTeacherInput = {
            id: req.body.id ,
           name: req.body.name ,
           email: req.body.email,
           birthDate: req.body.birthDate ,
           specialty: req.body.specialty,
           class_id: req.body.class_id
        }
        if(!input.id|| !input.name || !input.birthDate
            || input.specialty.length>1 ){
                errorCode = 422
                throw new Error("Preencha os campos corretamente.")
            }

            await connection.raw(`
            ISERT INTO TEACHER(id, name, email, birthDate, class_id)
            VALUES (
                ${input.id},
                "${input.name}",
                "${input.email}",
                "${input.birthDate}",
                "${input.class_id}"
            );
    
            `)
    
            for (let specialty of input.specialty){
               
    
                await connection.raw(`
                ISENT INTO STUDENT_HOBBY(student_id, hobby_id)
                VALUES(
                    ${input.id},
                    ${SPECIALTY[specialty]}
                )
                `)
                
            }
    
            res.status(201).send({message: "Criado com sucesso"})
    
    

    } catch (error) {
        res.status(errorCode).send({message: error})
    }
    

})
    
app.put("/teacher", async (req: Request, res: Response)=>{

    let erroCode =400;
  try {

    const input: updateTeacherInput = {
        teacher_id: req.body.teacher_id,
        class_id: req.body.class_id
    }

    await connection.raw (`
    UPDATE TEACHER 
    SET class_id = ${input.class_id}
    WHERE id = ${input.teacher_id}
    `)

    res.status(200).send({message: "Atualizado com sucesso!"})
}  catch (error) {

    res.status(erroCode).send({message: error})
}
})
    
        

const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
       const address = server.address() as AddressInfo;
       console.log(`Server is running in http://localhost: ${address.port}`);
    } else {
       console.error(`Failure upon starting server.`);
    }
});