# Vercel Deployment Checklist

## ✅ Pre-Deployment

- [ ] **Environment Variables Set**
  - [ ] `ELEVENLABS_API_KEY` added to Vercel project settings
  - [ ] `ELEVENLABS_VOICE_ID` added (optional, defaults to Rachel)
  - [ ] Tested locally with `vercel dev`

- [ ] **Code Review**
  - [ ] API endpoint `/api/tts.ts` is secure
  - [ ] Frontend uses `/api/tts` instead of direct ElevenLabs calls
  - [ ] No `VITE_ELEVENLABS_API_KEY` in frontend code
  - [ ] Error handling implemented

- [ ] **Testing**
  - [ ] Local development works with `vercel dev`
  - [ ] TTS audio plays correctly
  - [ ] Error messages are user-friendly
  - [ ] Rate limiting works (test with multiple requests)

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Project
```bash
# From project root
vercel

# Follow prompts:
# - Link to existing project? (Y/N)
# - Project name: learn-german-guide
# - Directory: ./
```

### 4. Set Environment Variables
```bash
# Set API key
vercel env add ELEVENLABS_API_KEY

# Set voice ID (optional)
vercel env add ELEVENLABS_VOICE_ID
```

### 5. Redeploy with Environment Variables
```bash
vercel --prod
```

## 🔍 Post-Deployment Verification

- [ ] **API Endpoint Test**
  ```bash
  curl -X POST https://your-app.vercel.app/api/tts \
    -H "Content-Type: application/json" \
    -d '{"text": "Hello World"}'
  ```

- [ ] **Frontend Test**
  - [ ] Open deployed app
  - [ ] Navigate to lessons
  - [ ] Click speaker icons
  - [ ] Verify audio plays
  - [ ] Check browser network tab for `/api/tts` calls

- [ ] **Error Handling Test**
  - [ ] Test with invalid text (should show error)
  - [ ] Test rate limiting (make 30+ requests quickly)
  - [ ] Test network failure (disable internet)

## 📊 Monitoring Setup

- [ ] **Vercel Analytics**
  - [ ] Enable in Vercel dashboard
  - [ ] Monitor function invocations
  - [ ] Watch for errors

- [ ] **Logging**
  ```bash
  # Check function logs
  vercel logs
  ```

- [ ] **Performance**
  - [ ] Monitor response times
  - [ ] Check cache hit rates
  - [ ] Watch bandwidth usage

## 🔧 Production Optimizations

- [ ] **Caching**
  - [ ] Verify cache headers are set
  - [ ] Test cache effectiveness
  - [ ] Consider CDN for static audio files

- [ ] **Security**
  - [ ] Rate limiting is active
  - [ ] CORS headers are correct
  - [ ] No sensitive data in logs

- [ ] **Performance**
  - [ ] Function cold start times acceptable
  - [ ] Audio generation time reasonable
  - [ ] Frontend loading states work

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   ```bash
   # Check if set
   vercel env ls
   
   # Redeploy after adding
   vercel --prod
   ```

2. **API Endpoint Not Found**
   - Verify `/api/tts.ts` is in project root
   - Check Vercel function logs
   - Ensure TypeScript compilation works

3. **Audio Not Playing**
   - Check browser console for errors
   - Verify CORS headers
   - Test API endpoint directly

4. **Rate Limiting Issues**
   - Check IP detection logic
   - Verify rate limit settings
   - Test with different IPs

### Debug Commands

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs --follow

# Test API locally
vercel dev

# Check environment variables
vercel env pull .env.local
```

## 📈 Performance Metrics

Track these metrics post-deployment:

- **Response Time**: < 2 seconds for TTS generation
- **Cache Hit Rate**: > 80% for repeated requests
- **Error Rate**: < 1% of requests
- **Rate Limit Hits**: Monitor for abuse patterns

## 🔄 Updates and Maintenance

### Regular Tasks
- [ ] Monitor ElevenLabs usage
- [ ] Check Vercel function logs weekly
- [ ] Update voice IDs if needed
- [ ] Review rate limiting effectiveness

### Scaling Considerations
- [ ] Implement user-based rate limiting
- [ ] Consider Redis for distributed caching
- [ ] Add audio file pre-generation for common phrases
- [ ] Implement usage analytics

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **ElevenLabs API**: https://docs.elevenlabs.io
- **Function Logs**: `vercel logs`
- **Project Dashboard**: https://vercel.com/dashboard

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set
- [ ] API endpoint responds correctly
- [ ] Frontend TTS buttons work
- [ ] Error handling tested
- [ ] Rate limiting verified
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified of deployment

**Deployment Complete! 🎉**
