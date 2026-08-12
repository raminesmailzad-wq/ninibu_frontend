"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CornerDownLeft, Flag, Lock, MessageCircle, Send, ShieldAlert, X } from "lucide-react";
import type { CommunityComment, CommunityCommentListResponse, CommunityPost, CommunityPrivacyMode, CommunityReactionType } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { postTypeLabels, reactionLabels } from "./community-data";
import { formatRelativeFa } from "./time";

export function PostDetail({ postId, onClose, onReport }: { postId: number; onClose: () => void; onReport: (entityType: "community_post" | "community_comment", entityId: number) => void }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [replyTo, setReplyTo] = useState<CommunityComment | null>(null);
  const [body, setBody] = useState("");
  const [privacy, setPrivacy] = useState<CommunityPrivacyMode>("identified");

  const postQuery = useQuery({ queryKey:["community","post",postId], queryFn:()=>clientApi<CommunityPost>(`/api/ninibu/community/posts/${postId}`) });
  const commentsQuery = useQuery({ queryKey:["community","comments",postId,page], queryFn:()=>clientApi<CommunityCommentListResponse>(`/api/ninibu/community/posts/${postId}/comments?page=${page}&limit=30`) });
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey:["community","post",postId]}),
      queryClient.invalidateQueries({queryKey:["community","comments",postId]}),
      queryClient.invalidateQueries({queryKey:["community","feed"]}),
      queryClient.invalidateQueries({queryKey:["community","group-posts"]})
    ]);
  };

  const commentMutation = useMutation({
    mutationFn:()=>clientApi(`/api/ninibu/community/posts/${postId}/comments`,{method:"POST",body:JSON.stringify({body:body.trim(),privacy_mode:privacy,parent_comment_id:replyTo?.id})}),
    onSuccess: async()=>{setBody("");setReplyTo(null);await invalidate();}
  });
  const postReaction = useMutation({
    mutationFn:({type,active}:{type:CommunityReactionType;active:boolean})=>active
      ? clientApi<void>(`/api/ninibu/community/posts/${postId}/reactions/${type}`,{method:"DELETE"})
      : clientApi(`/api/ninibu/community/posts/${postId}/reactions`,{method:"POST",body:JSON.stringify({reaction_type:type})}),
    onSuccess:invalidate
  });
  const commentReaction = useMutation({
    mutationFn:({comment,type,active}:{comment:CommunityComment;type:CommunityReactionType;active:boolean})=>active
      ? clientApi<void>(`/api/ninibu/community/comments/${comment.id}/reactions/${type}`,{method:"DELETE"})
      : clientApi(`/api/ninibu/community/comments/${comment.id}/reactions`,{method:"POST",body:JSON.stringify({reaction_type:type})}),
    onSuccess:invalidate
  });

  const post=postQuery.data;
  const comments=commentsQuery.data?.items??[];
  return <div className="community-modal-backdrop post-detail-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}>
    <article className="post-detail" role="dialog" aria-modal="true" aria-label="جزئیات پست">
      <header className="post-detail-top"><div><span>گفت‌وگوی جامعه</span><strong>{post?.group_name||"نینیبو"}</strong></div><button onClick={onClose} aria-label="بستن"><X size={20}/></button></header>
      <div className="post-detail-scroll">
        {postQuery.isLoading && <div className="post-detail-loading"><Skeleton/><Skeleton/><Skeleton/></div>}
        {postQuery.isError && <div className="community-empty"><strong>پست دریافت نشد</strong><Button variant="outline" onClick={()=>postQuery.refetch()}>تلاش دوباره</Button></div>}
        {post && <>
          <div className="post-detail-author">
            <span>{post.author.is_anonymous?"؟":post.author.display_name.slice(0,1)}</span>
            <div><strong>{post.author.display_name}{post.author.author_type==="verified_clinician"&&<em><BadgeCheck size={14}/> متخصص تأییدشده</em>}</strong><small>{formatRelativeFa(post.published_at)} · {postTypeLabels[post.post_type]}</small></div>
            <button onClick={()=>onReport("community_post",post.id)} aria-label="گزارش"><Flag size={17}/></button>
          </div>
          <div className="post-detail-copy">{post.title&&<h1>{post.title}</h1>}<p>{post.body}</p>{post.requires_review&&<div className="review-chip"><ShieldAlert size={14}/> این محتوا برای بررسی ایمنی علامت‌گذاری شده است.</div>}{post.medical_disclaimer&&<div className="medical-disclaimer">{post.medical_disclaimer}</div>}</div>
          <div className="post-detail-reactions">{reactionLabels.map(({type,label,emoji})=>{const item=post.reactions?.find(r=>r.reaction_type===type);return <button key={type} disabled={postReaction.isPending} className={item?.reacted_by_me?"is-reacted":""} onClick={()=>postReaction.mutate({type,active:Boolean(item?.reacted_by_me)})}><span>{emoji}</span>{label}{item?.count?<b>{new Intl.NumberFormat("fa-IR").format(item.count)}</b>:null}</button>})}</div>
          <div className="comments-heading"><strong><MessageCircle size={17}/>{new Intl.NumberFormat("fa-IR").format(post.comment_count)} دیدگاه</strong>{post.is_locked&&<span><Lock size={13}/> دیدگاه‌ها بسته‌اند</span>}</div>
        </>}

        {commentsQuery.isLoading && <div className="comment-skeletons"><Skeleton/><Skeleton/><Skeleton/></div>}
        {comments.map((comment)=><CommentItem key={comment.id} comment={comment} busy={commentReaction.isPending} onReply={()=>setReplyTo(comment)} onReport={()=>onReport("community_comment",comment.id)} onReact={(type,active)=>commentReaction.mutate({comment,type,active})}/>) }
        {commentsQuery.data && commentsQuery.data.pagination.total_pages>1&&<div className="community-pagination"><Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>قبلی</Button><span>{new Intl.NumberFormat("fa-IR").format(page)} / {new Intl.NumberFormat("fa-IR").format(commentsQuery.data.pagination.total_pages)}</span><Button variant="outline" disabled={page>=commentsQuery.data.pagination.total_pages} onClick={()=>setPage(p=>p+1)}>بعدی</Button></div>}
      </div>
      {post&&!post.is_locked&&<div className="comment-composer">{replyTo&&<div className="reply-banner"><span>پاسخ به {replyTo.author.display_name}</span><button onClick={()=>setReplyTo(null)}><X size={14}/></button></div>}<Textarea rows={2} maxLength={5000} value={body} onChange={(e)=>setBody(e.target.value)} placeholder="دیدگاه‌تان را بنویسید..."/><div><Select value={privacy} onChange={(e)=>setPrivacy(e.target.value as CommunityPrivacyMode)}><option value="identified">با نام</option><option value="anonymous">ناشناس</option></Select><Button disabled={!body.trim()||commentMutation.isPending} onClick={()=>commentMutation.mutate()}><Send size={16}/>{commentMutation.isPending?"ارسال...":"ارسال"}</Button></div>{commentMutation.isError&&<p className="dialog-error">{commentMutation.error.message}</p>}</div>}
    </article>
  </div>;
}

function CommentItem({comment,busy,onReply,onReport,onReact}:{comment:CommunityComment;busy:boolean;onReply:()=>void;onReport:()=>void;onReact:(type:CommunityReactionType,active:boolean)=>void}){
  return <div className={`community-comment depth-${comment.depth}`}><div className="comment-avatar">{comment.author.is_anonymous?"؟":comment.author.display_name.slice(0,1)}</div><div className="comment-content"><div className="comment-head"><div><strong>{comment.author.display_name}{comment.author.author_type==="verified_clinician"&&<BadgeCheck size={13}/>}</strong><small>{formatRelativeFa(comment.created_at)}</small></div><button onClick={onReport}><Flag size={14}/></button></div><p>{comment.body}</p><div className="comment-actions">{reactionLabels.slice(1).map(({type,label})=>{const r=comment.reactions?.find(i=>i.reaction_type===type);return <button key={type} disabled={busy} className={r?.reacted_by_me?"is-reacted":""} onClick={()=>onReact(type,Boolean(r?.reacted_by_me))}>{label}{r?.count?` ${new Intl.NumberFormat("fa-IR").format(r.count)}`:""}</button>})}{comment.depth===0&&<button onClick={onReply}><CornerDownLeft size={13}/> پاسخ</button>}</div></div></div>
}
