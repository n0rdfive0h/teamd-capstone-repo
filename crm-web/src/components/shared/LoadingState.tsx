export function LoadingState({message} : {message?:string}) {
    return <p role="status">{message ?? "Loading..."}</p>
}