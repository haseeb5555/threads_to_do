import ThreadCard from "@/components/cards/ThreadCard"
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const  Page =  async ({params}:{params:{id:string}}) => {
  
      if(!params.id) return null;
  
      const user = await currentUser()
      if(!user) return null;
  
      const userInfo = await fetchUser(user.id)
      if (!userInfo?.onboarded) redirect('/onboarding')
       const post = await fetchThreadById(params.id)
  return (
     <section className="relative">
      <div>
      <ThreadCard
             key={post._id}
              id={post._id}
              currentUserId={user?.id || ''}
              parentId={post.parentId}
              content={post.text}
              author ={post.author}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.children}
            />
      </div>
      <div className="mt-7">
         <Comment threadId={post.id}
                  currentUserId={JSON.stringify(userInfo?._id)}
                  currentUserImg={userInfo.image}
         />

      </div>
       <div className="mt-10">
         {post.children.map((item:any)=>(
               <ThreadCard
               key={item._id}
                id={item._id}
                currentUserId={user?.id || ''}
                parentId={item.parentId}
                content={item.text}
                author ={item.author}
                community={item.community}
                createdAt={item.createdAt}
                comments={item.children}
                isComment
              />
         ))}
       </div>

     </section>
  )
}

export default Page
