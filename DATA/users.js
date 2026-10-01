export const trainingUsers = [
    {
        userid: "CAPA001",
        password: "VISION01",
        name: "USUARIO CAPACITACION 01",
        role: "ADVISOR"
    },
    {
        userid: "CAPA002",
        password: "VISION02",
        name: "USUARIO CAPACITACION 02",
        role: "ADVISOR"
    },
    {
        userid: "FORMADOR",
        password: "TRAINING",
        name: "FORMADOR CAPACITACION",
        role: "TRAINER"
    }
];

export function validateTrainingUser(userid, password) {

    const normalizedUser =
        userid.trim().toUpperCase();

    return trainingUsers.find(user =>
        user.userid === normalizedUser &&
        user.password === password
    ) || null;
}
