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

type createClassInput = {
 id: number ,
name: string ,
startDate: string ,
endDate: string ,
module:  number,
type: CLASS_TYPE
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
        res.status(201).send({ message:"Tumar criada com sucesso."})


    }catch (error) {
        res.status(errorCode).send({message: error})
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