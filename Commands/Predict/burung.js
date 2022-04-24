const { CommandInteraction, MessageEmbed } = require("discord.js");
const axios = require("axios");
const FormData = require('form-data');

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
        `Ready to predict! Please send a picture of your burung (jpeg/jpg/png only!)`,
        ephemeral: true,
    });

    // Start collecting messages
    const filter = m => m.author.equals(user);
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('end', async (collected) => {
        if (collected.size == 0) {
            return interaction.editReply({
                content: undefined,
                embeds: [
                  Response.setDescription("😭 Hello... Are you still there?").setColor(
                    "RED"
                  ),
                ],
              })
        } else {
            if (collected.first().attachments.size == 0) {
                return interaction.editReply({
                    content: undefined,
                    embeds: [
                        Response.setDescription("😤 No attachments detected!").setColor(
                        "RED"
                        ),
                    ],
                })
            }
            let targetAttachment = collected.first().attachments.first()
            let file = targetAttachment.attachment
            let fileType = targetAttachment.contentType

            if (["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
                const form = new FormData()
                // Parse file into Form Data
                form.append('file', file, targetAttachment.name)

                // Send the file to the API
                const response = await axios.post("https://prima-openapi.herokuapp.com/predict/bird", form, {
                    headers: {
                        ...form.getHeaders()
                    },
                });

                if (response.status == 200) {
                    console.log(response.data)
                    // Check if any results are returned at all
                    if (response.data.size == 0) {
                        return interaction.editReply({
                            embeds: [
                              Response.setDescription("🥲 API Error... Please wait / contact dev...").setColor(
                                "RED"
                              ),
                            ],
                        })
                    }
                    // Check for undefined values
                    let result = response.data[0]
                    if (result.class == undefined || result.confidence == undefined) {
                        console.log(result);
                        return interaction.editReply({
                            embeds: [
                              Response.setDescription("🥲 API Error... Please wait / contact dev...").setColor(
                                "RED"
                              ),
                            ],
                        })
                    }

                    // Finally, return results
                    collected.first().reply({
                        content:
                        `I believe this is a ${result.class} with a ${result.confidence}% confidence`
                    })
                } else {
                    return interaction.editReply({
                        embeds: [
                          Response.setDescription("🥲 API Error... Please wait / contact dev...").setColor(
                            "RED"
                          ),
                        ],
                    })
                }
            } else {
                console.log(fileType)
                return interaction.editReply({
                    content: undefined,
                    embeds: [
                        Response.setDescription("😤 Attachment must be jpeg/png!").setColor(
                        "RED"
                        ),
                    ],
                })
            }
        }
    })
  },
};
