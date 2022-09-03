import sb from "solidbuff/browser";

fetch("http://localhost:8000/")
    .then((res) => res.arrayBuffer())
    .then((buff) => {
        console.log("buffer", buff);
        const result = sb.deserialize(buff);
        console.log("deserialized", result); // { date: new Date(0) }

        const valuesAreSame = result.date?.valueOf() === new Date(0).valueOf();
        console.log(`values between client and server are "${valuesAreSame ? "same" : "different"}"`);
    });
