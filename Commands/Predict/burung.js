const { CommandInteraction, MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "burung",
  description: "Prediksi burung. Nuff said",

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { user } = interaction;

    // Basic metadata
    const Response = new MessageEmbed()
      .setFooter({
        text: `API Powered By: prima-openAPI | Created By: XIO84 | Requested by: ArThreeMis`,
      })
      .setColor("YELLOW")
      .setAuthor({ name: `Burung` });

    // Reply to get the picture
    interaction.reply({
      content:
        `Ready to predict! Please send a picture of your burung`,
        ephemeral: true,
    });

    // Start collecting messages
    const filter = m => m.author.equals(user);
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('end', collected => {
        if (collected.size == 0) {
            return interaction.editReply({
                content: undefined,
                embeds: [
                  Response.setDescription("😭 API Mismatch, Please contact dev!").setColor(
                    "RED"
                  ),
                ],
              })
        }
    })

    // Create the API request
    const quizContent = await axios({
      method: "get",
      url: `https://opentdb.com/api.php?amount=1&category=${topic}&difficulty=${difficulty}&type=multiple`,
    });

    if (quizContent.status == 200 && quizContent.data.response_code == 0) {
      const question = quizContent.data.results[0].question
      const answers = quizContent.data.results[0].incorrect_answers
      const correctAnswer = quizContent.data.results[0].correct_answer
      // console.log(correctAnswer);
      // Check validity of response
      if (question == undefined || answers == undefined || correctAnswer == undefined) {
        console.log(quizContent.data)
        console.log(Object.keys(quizContent.data.results[0]))
        return interaction.editReply({
          content: undefined,
          embeds: [
            Response.setDescription("😭 API Mismatch, Please contact dev!").setColor(
              "RED"
            ),
          ],
        })
      }

      if (!(Array.isArray(answers))) {
        console.log(quizContent.data)
        console.log(quizContent.data.results[0])
        return interaction.editReply({
          content: undefined,
          embeds: [
            Response.setDescription("😭 API Mismatch, Please contact dev!").setColor(
              "RED"
            ),
          ],
        })
      }

      answers.push(correctAnswer)
      // Scramble array
      answers.sort(() => Math.random() - 0.5)
      interaction.followUp({
        content:
          `Question: ${question} \n\nChoices: (${answers.join('/')}) \n\nPlease answer within 10 seconds! Multiple entries will not be recorded. Please write the answer exactly as the choices given.`
      })

      // Start collecting messages
      const collector = interaction.channel.createMessageCollector({ time: 10000 });

      
      // collector.on('collect', m => {
      //   console.log(`Collected ${m.content}`);
      // });

      // Find a unique and first correct answer
      collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
        const answered_users = new Set()
        let filtered_ans = collected.filter((message) => {
          return !(message.author.bot)
        })
        .filter((message) => {
          if (answered_users.has(message.author)) {
            return false
          } else {
            answered_users.add(message.author)
            return true
          }
        })
        .filter((message) => {
          return message.content.toUpperCase() === correctAnswer.toUpperCase()
        })

        // Get winner if any
        if (filtered_ans.size > 0) {
          const winner = filtered_ans.first().author
          interaction.channel.send({
            content:
            `Congratulations <@${winner.id}>! You won the quiz!!`
          })
        } else {
          interaction.channel.send({
            content:
            `No one got it correct... The answer was ${correctAnswer}`
          })
        }

        collector.stop("quiz ended");
      });
      return

    } else {
      return interaction.editReply({
        embeds: [
          Response.setDescription("🥲 API Error... Please wait / contact dev...").setColor(
            "RED"
          ),
        ],
      })
    }
  },
};
